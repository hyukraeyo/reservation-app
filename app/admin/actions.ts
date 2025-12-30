'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushNotification } from '@/utils/push'
import type { Reservation } from '@/app/types'

/**
 * 현재 사용자가 관리자(admin) 또는 사장(owner)인지 확인합니다.
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
 * 모든 사용자 목록을 가져옵니다. (관리자 전용)
 */
export async function getUsers() {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error('권한이 없습니다.')

  const supabase = await createClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
  
  if (error) throw new Error(error.message)
  return profiles
}

/**
 * 사용자 역할을 변경합니다. (관리자 전용)
 */
export async function updateUserRole(userId: string, newRole: string) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error('권한이 없습니다.')

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
        email
      )
    `)
    .order('time', { ascending: false })

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
  
  // 고객에게 알림 전송
  try {
    const subscription = reservation.profiles?.push_subscription
    if (subscription) {
      const title = status === 'confirmed' ? '예약이 확정되었습니다!' : '예약이 취소되었습니다.'
      const body = status === 'confirmed' 
        ? `신청하신 ${new Date(reservation.time).toLocaleString('ko-KR')} 예약이 승인되었습니다.`
        : `죄송합니다. ${new Date(reservation.time).toLocaleString('ko-KR')} 예약이 취소되었습니다.`
      
      await sendPushNotification(subscription, title, body, '/')
    }
  } catch (err) {
    console.error('고객 알림 전송 실패:', err);
  }

  revalidatePath('/admin/reservations')
  revalidatePath('/admin')
  return { success: true }
}
