
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 로그인 후 이동할 페이지 (기본값: 메인 화면 '/')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 인증 성공 시 메인 화면(또는 next)으로 리다이렉트
      return redirect(`${origin}${next}`)
    }
  }

  // 인증 실패 시 오류 페이지로 이동
  return redirect(`${origin}/auth/auth-code-error`)
}
