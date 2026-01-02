'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendPushNotification } from '@/utils/push'
import { saveNotification } from '@/utils/notification'
import type { Reservation } from '@/app/types'

// Admin 작업을 위한 Service Role Client
// 이 키는 서버 사이드에서만 사용되므로 안전합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * 현재 사용자가 관리자(admin) 또는 사장(owner)인지 확인합니다.
 * 관리자 페이지 접근 권한 체크에 사용됩니다.
 */
export async function checkAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' || profile?.role === 'owner'
}

/**
 * 현재 사용자가 최고 관리자(admin)인지 확인합니다.
 * 사용자 역할 변경 등 민감한 작업에 사용됩니다.
 */
export async function checkSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

/**
 * 모든 사용자 목록을 가져옵니다. (admin 전용)
 * profiles 테이블과 auth.users(메타데이터)를 병합하여 반환합니다.
 */
export async function getUsers() {
  const isSuperAdmin = await checkSuperAdmin()
  if (!isSuperAdmin) {
    redirect('/')
  }

  // 1. Profiles (DB)
  const supabase = await createClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)

  // 2. Auth Users (Metadata -> memo, created_at)
  // supabaseAdmin을 사용하여 모든 유저 정보 가져오기 (Service Role 필요)
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000
  })

  if (authError) {
    console.warn('Auth user list fetch failed:', authError)
    // Auth 정보 조회 실패 시 profiles만 반환 (메모, 가입일 누락될 수 있음)
    return profiles
  }

  // 3. 병합
  const mergedUsers = profiles.map(profile => {
    const authUser = authUsers.find(u => u.id === profile.id)
    return {
      ...profile,
      // Metadata의 memo가 있으면 사용
      memo: (authUser?.user_metadata?.memo as string) || profile.memo || null,
      // Auth User의 created_at 사용
      created_at: authUser?.created_at || profile.created_at || null
    }
  })

  return mergedUsers
}

/**
 * 사용자 역할을 변경합니다. (admin 전용 - owner는 불가)
 */
export async function updateUserRole(userId: string, newRole: string) {
  const isSuperAdmin = await checkSuperAdmin()
  if (!isSuperAdmin) throw new Error('최고 관리자만 역할을 변경할 수 있습니다.')

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

/**
 * 모든 예약 목록을 가져옵니다. (관리자 전용)
 */
export async function getReservations(): Promise<Reservation[]> {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error('권한이 없습니다.')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      profiles (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data as unknown as Reservation[]
}

/**
 * 예약 상태를 변경하고 고객에게 알림을 보냅니다. (관리자 전용)
 */
export async function updateReservationStatus(
  reservationId: string,
  status: 'confirmed' | 'cancelled'
) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error('권한이 없습니다.')

  const supabase = await createClient()

  const { data: reservation, error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', reservationId)
    .select('*, profiles(push_subscription)')
    .single()

  if (error) return { error: error.message }

  // 고객에게 알림 전송 및 저장
  try {
    const subscription = reservation.profiles?.push_subscription
    const title = status === 'confirmed' ? '예약이 확정되었습니다!' : '예약이 취소되었습니다.'
    const body = status === 'confirmed'
      ? `신청하신 ${new Date(reservation.time).toLocaleString('ko-KR')} 예약이 승인되었습니다.`
      : `죄송합니다. ${new Date(reservation.time).toLocaleString('ko-KR')} 예약이 취소되었습니다.`

    // DB에 알림 저장
    await saveNotification(reservation.user_id, title, body, '/my')

    // 푸시 전송
    if (subscription) {
      await sendPushNotification(subscription, title, body, '/')
    }
  } catch (err) {
    console.error('고객 알림 전송 실패:', err);
  }

  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return { success: true }
}

/**
 * 사용자 메모를 업데이트합니다. (관리자 전용)
 * profiles 테이블에 컬럼이 없을 경우를 대비해 user_metadata에 저장합니다.
 * 이 방식은 DB 마이그레이션 없이도 데이터를 저장할 수 있습니다.
 */
export async function updateUserMemo(userId: string, memo: string) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error('권한이 없습니다.')

  // 1. user_metadata에 저장 (Admin API 사용)
  const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { memo: memo }
  })

  if (metaError) {
    console.error('Meta update failed:', metaError)
    return { error: '메모 저장 실패: ' + metaError.message }
  }

  // 데이터 갱신을 위해 경로 재검증
  revalidatePath('/admin/users')
  return { success: true }
}
