import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with cross-request state pollution.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const hasSelectedResidence = request.cookies.has('selected_residence')
    const isLoginPath = request.nextUrl.pathname.startsWith('/login')
    const isSelectResidencePath = request.nextUrl.pathname.startsWith('/selecionar-residencia')
    const isAuthPath = request.nextUrl.pathname.startsWith('/auth')
    const isRecoverPath = request.nextUrl.pathname.startsWith('/recuperar-senha')
    const isResetPath = request.nextUrl.pathname.startsWith('/redefinir-senha')
    const isRootPath = request.nextUrl.pathname === '/'

    if (!user && !isLoginPath && !isAuthPath && !isRecoverPath && !isResetPath) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If logged in but no residence selected, and trying to access a protected route
    if (user && !hasSelectedResidence && !isLoginPath && !isAuthPath && !isSelectResidencePath) {
        const url = request.nextUrl.clone()
        url.pathname = '/selecionar-residencia'
        return NextResponse.redirect(url)
    }

    // If the user is logged in, has a residence, and trying to access login or root
    if (user && hasSelectedResidence && (isLoginPath || isRootPath)) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
