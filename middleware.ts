import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

// Verificar se as variáveis de ambiente do Supabase estão disponíveis
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function middleware(request: NextRequest) {
  // Se o Supabase não estiver configurado, continuar sem autenticação
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  const res = NextResponse.next()

  // Criar um cliente Supabase configurado para usar cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Verificar se é um callback de autenticação
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Trocar o código por uma sessão
    await supabase.auth.exchangeCodeForSession(code)
    // Redirecionar para a página inicial após autenticação bem-sucedida
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Atualizar sessão se expirada - necessário para Server Components
  await supabase.auth.getSession()

  // Rotas protegidas - redirecionar para login se não autenticado
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname === "/auth/callback"

  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/browse") ||
    request.nextUrl.pathname.startsWith("/universidade")

  if (!isAuthRoute && !isPublicRoute) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const redirectUrl = new URL("/login", request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
