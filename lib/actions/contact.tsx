"use server"

import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  name: string
  email: string
  message: string
}

export async function sendContactMessage(data: ContactFormData) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Deves estar autenticado para enviar mensagens" }
    }

    const adminEmail = "ggomes.l21@us.edu.cv"

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">Nova Mensagem de Contacto</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nome:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>ID do Utilizador:</strong> ${user.id}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Mensagem:</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="color: #64748b; font-size: 14px;">
          Enviado através do formulário de contacto do Repositório Akadox
        </p>
      </div>
    `

    console.log("[v0] Contact email would be sent to:", adminEmail)
    console.log("[v0] From:", data.email)
    console.log("[v0] Message:", data.message)

    // In production, uncomment this to actually send emails:
    // await resend.emails.send({
    //   from: 'Akadox <noreply@akadox.cv>',
    //   to: adminEmail,
    //   subject: `Contacto: ${data.name}`,
    //   html: emailHtml,
    // })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending contact message:", error)
    return { success: false, error: "Erro ao enviar mensagem. Tenta novamente." }
  }
}
