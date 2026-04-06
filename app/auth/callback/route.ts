import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // se next for passado como parametro, usamos para redirecionar após o login
  const next = searchParams.get('next') ?? '/selecionar-residencia'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Falha na autenticação ou não enviou o `code`
  return NextResponse.redirect(`${origin}/login?error=Nao_foi_possivel_autenticar`)
}
