'use server'

import { createClient } from '@/utils/supabase/server';
import { Client as QStashClient } from "@upstash/qstash";
import { startOfDay, endOfDay, subHours, isFuture } from 'date-fns';
import { sendPushNotification } from '@/utils/push';

// Defensive initialization of QStash
const qstash = process.env.QSTASH_TOKEN
  ? new QStashClient({ token: process.env.QSTASH_TOKEN })
  : null;

/**
 * Saves a push subscription to the user's profile.
 */
export async function saveSubscription(subscription: PushSubscription) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: '인증되지 않은 사용자입니다.' };

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      push_subscription: subscription
    });

  return error ? { error: error.message } : { success: true };
}

/**
 * Fetches reserved time slots for a specific date.
 */
export async function getReservationsByDate(dateStr: string) {
  const supabase = await createClient();
  const targetDate = new Date(dateStr);

  const { data, error } = await supabase
    .from('reservations')
    .select('time')
    .gte('time', startOfDay(targetDate).toISOString())
    .lte('time', endOfDay(targetDate).toISOString())
    .neq('status', 'cancelled');

  if (error) {
    console.error('Failed to fetch reservations:', error);
    return [];
  }

  return data.map(r => r.time);
}

/**
 * Creates a new reservation and handles notifications.
 */
export async function createReservation(time: Date) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("권한이 없습니다.");

  // Check availability
  const { data: existing } = await supabase
    .from('reservations')
    .select('id')
    .eq('time', time.toISOString())
    .neq('status', 'cancelled')
    .maybeSingle();

  if (existing) throw new Error("이미 예약된 시간입니다.");

  // 1. Insert Reservation
  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      user_id: user.id,
      time: time.toISOString(),
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 2. Schedule Notification (1 hour before)
  const notificationTime = subHours(time, 1);
  if (qstash && isFuture(notificationTime)) {
    try {
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/reminder`,
        body: { reservation_id: reservation.id },
        notBefore: Math.floor(notificationTime.getTime() / 1000),
      });
    } catch (err) {
      console.error("QStash scheduling failed:", err);
    }
  }

  // 3. Notify Admins
  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('push_subscription')
      .in('role', ['owner', 'admin'])
      .not('push_subscription', 'is', null);

    if (admins?.length) {
      console.log(`[Notification] ${admins.length}명의 관리자/사장님에게 알림을 전송합니다.`);

      const timeStr = time.toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      await Promise.allSettled(
        admins.map(admin =>
          sendPushNotification(
            admin.push_subscription,
            '새로운 예약 알림',
            `${user.email}님이 ${timeStr}에 예약하셨습니다.`,
            '/admin/reservations'
          )
        )
      );
    }
  } catch (err) {
    console.error('Admin notification failed:', err);
  }

  // 4. Notify User (Immediate Confirmation)
  try {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('push_subscription')
      .eq('id', user.id)
      .single();

    if (currentUserProfile?.push_subscription) {
      const timeStr = time.toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      await sendPushNotification(
        currentUserProfile.push_subscription,
        '예약 대기 중',
        `${timeStr} 예약이 접수되었습니다. 확정 시 다시 알려드릴게요!`,
        '/'
      );
    }
  } catch (err) {
    console.error('User notification failed:', err);
  }

  return reservation;
}

/**
 * Fetches the current user's reservation history.
 */
export async function getMyReservations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', user.id)
    .order('time', { ascending: false });

  if (error) {
    console.error('Failed to fetch my reservations:', error);
    return [];
  }

  return data;
}

/**
 * Allows a user to cancel their own reservation.
 */
export async function cancelMyReservation(reservationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  // Check if the reservation belongs to the user
  const { data: reservation, error: fetchError } = await supabase
    .from('reservations')
    .select('id, user_id, time')
    .eq('id', reservationId)
    .single();

  if (fetchError || !reservation) {
    throw new Error('예약을 찾을 수 없습니다.');
  }

  if (reservation.user_id !== user.id) {
    throw new Error('본인의 예약만 취소할 수 있습니다.');
  }

  // Prevent cancelling past reservations
  if (new Date(reservation.time) < new Date()) {
    throw new Error('이미 지난 예약은 취소할 수 없습니다.');
  }

  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId);

  if (error) {
    throw new Error('예약 취소 중 오류가 발생했습니다.');
  }

  // 1. Notify Admins about the cancellation
  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('push_subscription')
      .in('role', ['owner', 'admin'])
      .not('push_subscription', 'is', null);

    if (admins?.length) {
      const timeStr = new Date(reservation.time).toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      await Promise.allSettled(
        admins.map(admin =>
          sendPushNotification(
            admin.push_subscription,
            '예약 취소 알림',
            `${user.email}님이 ${timeStr} 예약을 취소했습니다.`,
            '/admin/reservations'
          )
        )
      );
    }
  } catch (err) {
    console.error('Admin cancellation notification failed:', err);
  }

  // 2. Notify User (Confirmation)
  try {
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('push_subscription')
      .eq('id', user.id)
      .single();

    if (currentUserProfile?.push_subscription) {
      const timeStr = new Date(reservation.time).toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      await sendPushNotification(
        currentUserProfile.push_subscription,
        '예약 취소 완료',
        `${timeStr} 예약이 정상적으로 취소되었습니다.`,
        '/my'
      );
    }
  } catch (err) {
    console.error('User cancellation notification failed:', err);
  }

  return { success: true };
}
