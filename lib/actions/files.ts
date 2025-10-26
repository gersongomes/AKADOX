"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadFile(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Utilizador não autenticado" }
  }

  try {
    const { data: profiles, error: profileError } = await supabase
      .from("perfis_usuarios")
      .select("id")
      .eq("id", user.id)

    if (profileError) {
      console.error("[v0] Error checking profile:", profileError)
      return { success: false, error: "Erro ao verificar perfil" }
    }

    if (!profiles || profiles.length === 0) {
      console.log("[v0] User profile not found, creating one...")

      const { error: createProfileError } = await supabase.from("perfis_usuarios").insert({
        id: user.id,
        email: user.email || "",
        nome_completo: user.user_metadata?.name || user.email?.split("@")[0] || "Utilizador",
        tipo_usuario: "pessoa_comum", // Changed from "comum" to "pessoa_comum" to match check constraint
        pontos: 0,
        nivel: 1,
        aprovado: true,
        ativo: true,
      })

      if (createProfileError) {
        console.error("[v0] Error creating profile:", createProfileError)
        return {
          success: false,
          error: "Erro ao criar perfil. Por favor, contacte o suporte.",
        }
      }

      console.log("[v0] Profile created successfully for user:", user.id)
    }

    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const university = formData.get("university") as string
    const subject = formData.get("subject") as string
    const fileType = formData.get("fileType") as string
    const year = formData.get("year") as string
    const tags = JSON.parse((formData.get("tags") as string) || "[]")

    if (!file || !title || !university || !subject || !fileType) {
      return { success: false, error: "Campos obrigatórios em falta" }
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `uploads/${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      return { success: false, error: "Erro ao carregar ficheiro" }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath)

    // Get university ID
    const { data: universityData } = await supabase.from("universidades").select("id").eq("nome", university).single()

    // Insert document metadata
    const { data: document, error: insertError } = await supabase
      .from("documentos")
      .insert({
        titulo: title,
        descricao: description,
        tipo_arquivo: fileType,
        tamanho_arquivo: file.size,
        url_arquivo: publicUrl,
        universidade_id: universityData?.id,
        autor_id: user.id,
        ano_publicacao: year ? Number.parseInt(year.split("/")[0]) : new Date().getFullYear(),
        tags: tags,
        categoria: subject,
        aprovado: false, // Requires approval
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      // Clean up uploaded file
      await supabase.storage.from("documents").remove([filePath])
      return { success: false, error: "Erro ao guardar metadados" }
    }

    revalidatePath("/upload")
    revalidatePath("/browse")

    return { success: true, data: document }
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return { success: false, error: "Erro inesperado ao carregar ficheiro" }
  }
}

export async function getRecentUploads(userId: string, limit = 5) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("documentos")
    .select(
      `
      id,
      titulo,
      tipo_arquivo,
      categoria,
      created_at,
      visualizacoes
    `,
    )
    .eq("autor_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching recent uploads:", error)
    return []
  }

  return data
}

export async function downloadFile(documentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  try {
    // Get document info
    const { data: document, error: docError } = await supabase
      .from("documentos")
      .select("url_arquivo, titulo, downloads")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      console.error("[v0] Error fetching document:", docError)
      return { success: false, error: "Documento não encontrado" }
    }

    // Increment download counter
    const { error: updateError } = await supabase
      .from("documentos")
      .update({ downloads: (document.downloads || 0) + 1 })
      .eq("id", documentId)

    if (updateError) {
      console.error("[v0] Error updating download count:", updateError)
    }

    // Extract file path from URL
    const urlParts = document.url_arquivo.split("/")
    const filePath = urlParts.slice(-3).join("/") // uploads/userId/filename

    // Get signed URL for download (valid for 60 seconds)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("documents")
      .createSignedUrl(filePath, 60, {
        download: true,
      })

    if (urlError || !signedUrlData) {
      console.error("[v0] Error creating signed URL:", urlError)
      // Fallback to public URL
      return { success: true, url: document.url_arquivo, filename: document.titulo }
    }

    revalidatePath(`/browse/${documentId}`)
    return { success: true, url: signedUrlData.signedUrl, filename: document.titulo }
  } catch (error) {
    console.error("[v0] Download error:", error)
    return { success: false, error: "Erro ao preparar download" }
  }
}

export async function deleteFile(fileId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Não autenticado" }
  }

  // Get file info
  const { data: file } = await supabase.from("documentos").select("url_arquivo, autor_id").eq("id", fileId).single()

  if (!file || file.autor_id !== user.id) {
    return { success: false, error: "Sem permissão" }
  }

  // Delete from storage
  const filePath = file.url_arquivo.split("/").slice(-3).join("/")
  await supabase.storage.from("documents").remove([filePath])

  // Delete from database
  const { error } = await supabase.from("documentos").delete().eq("id", fileId)

  if (error) {
    return { success: false, error: "Erro ao eliminar ficheiro" }
  }

  revalidatePath("/profile")
  return { success: true }
}
