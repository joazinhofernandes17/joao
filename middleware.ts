import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rotas que nunca redirecionam — acessíveis sem sessão
const PUBLIC_PREFIXES = [
  '/auth',
  '/test-pipeline',
  '/train-lora',
  '/api/',
  '/_next/',
]

const PROTECTED_PREFIXES = ['/dashboard']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rotas públicas — passa directamente sem verificar sessão
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p)) || pathname === '/') {
    return NextResponse.next({ request })
  }

  // Se as variáveis Supabase não estiverem configuradas, deixar passar
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[middleware] Supabase env vars em falta — a deixar passar sem auth')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const allCookies = request.cookies.getAll()
  const authCookies = allCookies.filter(c => c.name.includes('auth') || c.name.includes('sb-'))
  console.log(`[middleware] ${pathname} | cookies auth: ${authCookies.length} | todos: ${allCookies.length}`)
  if (authCookies.length > 0) {
    console.log('[middleware] auth cookies:', authCookies.map(c => c.name).join(', '))
  }

  const { data: { user }, error } = await supabase.auth.getUser()
  console.log(`[middleware] getUser → user: ${user?.email ?? 'null'} | error: ${error?.message ?? 'none'}`)

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (isProtected && !user) {
    console.log(`[middleware] bloqueado — a redirecionar para /auth`)
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
