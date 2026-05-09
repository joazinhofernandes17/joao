import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          return document.cookie
            .split('; ')
            .filter(Boolean)
            .map(pair => {
              const idx = pair.indexOf('=')
              return { name: pair.slice(0, idx), value: pair.slice(idx + 1) }
            })
        },
        setAll(cookies) {
          if (typeof document === 'undefined') return
          cookies.forEach(({ name, value, options }) => {
            let str = `${name}=${value}`
            str += `; path=${options?.path ?? '/'}`
            str += `; samesite=${options?.sameSite ?? 'lax'}`
            if (options?.maxAge != null) str += `; max-age=${options.maxAge}`
            if (options?.domain) str += `; domain=${options.domain}`
            if (options?.secure) str += '; secure'
            document.cookie = str
          })
        },
      },
    }
  )
}
