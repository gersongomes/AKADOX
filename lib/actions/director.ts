"use server"

import { createServerClient } from "@/lib/supabase/server"

async function verifyDirectorAccess() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("Não autorizado")
  }

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("tipo_usuario, universidade_id")
    .eq("id", user.id)
    .single()

  if (!profile || profile.tipo_usuario !== "diretor") {
    throw new Error("Acesso negado - apenas diretores")
  }

  if (!profile.universidade_id) {
    throw new Error("Diretor sem universidade associada")
  }

  return { supabase, user, profile, universidadeId: profile.universidade_id }
}

export async function getDirectorStats() {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    const [
      { count: totalStudents },
      { count: totalProfessors },
      { count: totalDocuments },
      { count: pendingDocuments },
    ] = await Promise.all([
      supabase
        .from("perfis_usuarios")
        .select("*", { count: "exact", head: true })
        .eq("universidade_id", universidadeId)
        .eq("tipo_usuario", "aluno"),
      supabase
        .from("perfis_usuarios")
        .select("*", { count: "exact", head: true })
        .eq("universidade_id", universidadeId)
        .eq("tipo_usuario", "professor"),
      supabase.from("documentos").select("*", { count: "exact", head: true }).eq("universidade_id", universidadeId),
      supabase
        .from("documentos")
        .select("*", { count: "exact", head: true })
        .eq("universidade_id", universidadeId)
        .eq("aprovado", false),
    ])

    return {
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        totalProfessors: totalProfessors || 0,
        totalDocuments: totalDocuments || 0,
        pendingDocuments: pendingDocuments || 0,
      },
    }
  } catch (error) {
    console.error("[v0] Get director stats error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getUniversityDocuments(filters?: { aprovado?: boolean }) {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    let query = supabase
      .from("documentos")
      .select(`
        *,
        autor_id:perfis_usuarios!documentos_autor_id_fkey(nome_completo, email, tipo_usuario)
      `)
      .eq("universidade_id", universidadeId)
      .order("created_at", { ascending: false })

    if (filters?.aprovado !== undefined) {
      query = query.eq("aprovado", filters.aprovado)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error("[v0] Error fetching university documents:", error)
      throw new Error("Erro ao buscar documentos")
    }

    return { success: true, data: documents || [] }
  } catch (error) {
    console.error("[v0] Get university documents error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function getUniversityProfessors() {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    const { data: professors, error } = await supabase
      .from("perfis_usuarios")
      .select("*")
      .eq("universidade_id", universidadeId)
      .eq("tipo_usuario", "professor")
      .order("nome_completo", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching professors:", error)
      throw new Error("Erro ao buscar professores")
    }

    return { success: true, data: professors || [] }
  } catch (error) {
    console.error("[v0] Get professors error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function moderateUniversityDocument(documentId: string, approved: boolean) {
  try {
    const { supabase, user, universidadeId } = await verifyDirectorAccess()

    // Verify document belongs to this university
    const { data: doc } = await supabase.from("documentos").select("universidade_id").eq("id", documentId).single()

    if (!doc || doc.universidade_id !== universidadeId) {
      throw new Error("Documento não pertence a esta universidade")
    }

    const { error } = await supabase
      .from("documentos")
      .update({
        aprovado: approved,
        aprovado_por: user.id,
        aprovado_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    if (error) {
      console.error("[v0] Error moderating document:", error)
      throw new Error("Erro ao moderar documento")
    }

    return {
      success: true,
      message: approved ? "Documento aprovado com sucesso!" : "Documento recusado com sucesso!",
    }
  } catch (error) {
    console.error("[v0] Moderate document error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}

export async function deleteUniversityDocument(documentId: string) {
  try {
    const { supabase, universidadeId } = await verifyDirectorAccess()

    // Verify document belongs to this university
    const { data: doc } = await supabase
      .from("documentos")
      .select("universidade_id, autor_id")
      .eq("id", documentId)
      .single()

    if (!doc || doc.universidade_id !== universidadeId) {
      throw new Error("Documento não pertence a esta universidade")
    }

    const { error } = await supabase.from("documentos").delete().eq("id", documentId)

    if (error) {
      console.error("[v0] Error deleting document:", error)
      throw new Error("Erro ao eliminar documento")
    }

    return { success: true, message: "Documento eliminado com sucesso!" }
  } catch (error) {
    console.error("[v0] Delete document error:", error)
    return { error: error instanceof Error ? error.message : "Erro interno do servidor" }
  }
}
