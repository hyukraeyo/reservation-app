'use server'

import { createClient } from '@/utils/supabase/server'
import { Profile } from '@/app/types'

export async function updateUserProfile(formData: { name: string; phone: string }) {
    const supabase = await createClient()

    // 현재 로그인된 유저 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        console.error('Auth error:', authError)
        return { error: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.' }
    }

    const updates: Partial<Profile> = {}

    // 유효한 값만 업데이트 객체에 포함
    if (formData.name && formData.name.trim()) updates.name = formData.name
    if (formData.phone && formData.phone.trim()) updates.phone = formData.phone

    // 프로필 업데이트
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        console.error('Profile update failed:', error)
        return { error: error.message || '프로필 업데이트에 실패했습니다.', details: JSON.stringify(error) }
    }

    return { success: true }
}
