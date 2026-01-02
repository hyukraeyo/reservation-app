
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

  if (user) {
    // Check user profile status
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create initial profile
    if (!profile) {
      const { full_name, name, phone } = user.user_metadata || {}
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        name: full_name || name || null,
        phone: phone || null,
      })

      // Newly created profile might be missing info -> redirect
      if (!full_name && !name || !phone) {
        redirect('/complete-profile')
      }
    } else {
      // Profile exists, check for missing fields
      if (!profile.name || !profile.phone) {
        redirect('/complete-profile')
      }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const full_name = formData.get('full_name')?.toString()
  const phone = formData.get('phone')?.toString()

  if (!email || !password || !full_name || !phone) {
    return { error: '모든 필드를 입력해 주세요.' }
  }

  if (password.length < 6) {
    return { error: '비밀번호는 최소 6자 이상이어야 합니다.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { full_name, phone }
    }
  })

  if (error) {
    console.error('Signup Error:', error.message)
    return { error: error.message }
  }

  if (data.user && !data.user.identities?.length) {
    return { error: '이미 가입된 계정입니다.' }
  }

  return {
    success: true,
    message: '가입 확인 메일이 발송되었습니다. 이메일을 확인하여 가입을 완료해 주세요.'
  }
}

export async function signInWithKakao() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      scopes: 'profile_nickname profile_image account_email gender age_range birthday',
      queryParams: {
        scope: 'profile_nickname profile_image account_email gender age_range birthday',
        prompt: 'consent',
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

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
