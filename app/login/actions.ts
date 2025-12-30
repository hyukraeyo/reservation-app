
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  const { data: { user }, error: getUserError } = await supabase.auth.getUser()

  if (user?.email) {
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
    })
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 모두 입력해주세요.' }
  }

  if (password.length < 6) {
    return { error: '비밀번호는 6자 이상이어야 합니다.' }
  }

  // Use emailRedirectTo for proper PKCE flow in production
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  })

  if (error) {
    console.error('Signup Error:', error)
    return { error: error.message }
  }

  // If signUp is successful but user already exists (and email confirmation is on),
  // Supabase returns a fake success with user definition but null session.
  // We can't distinguish perfectly without admin rights, but we can give a hint.
  if (data?.user && data?.user?.identities?.length === 0) {
    return { error: '이미 가입된 이메일입니다.' }
  }

  return { success: true, message: '가입 확인 메일을 보냈습니다.\n이메일을 확인하여 가입을 완료해주세요.' }
}

export async function signInWithKakao() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        scope: 'profile_nickname,profile_image,account_email',
      },
    },
  })

  if (data.url) {
    return { url: data.url }
  }

  if (error) {
    return { error: error.message }
  }
}
