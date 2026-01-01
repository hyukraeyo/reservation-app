'use server'

import { createClient } from '@/utils/supabase/server';
import { Client as QStashClient } from "@upstash/qstash";
import { startOfDay, endOfDay, subHours, isFuture } from 'date-fns';
import { sendPushNotification } from '@/utils/push';
import { saveNotification } from '@/utils/notification';

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
 * Returns an array of ISO strings for all occupied 30-min blocks.
 */
export async function getReservationsByDate(dateStr: string) {
  const supabase = await createClient();
  // Ensure we cover the full day range to include any reservations that might overlap into this day
  // but strictly speaking our slots are within the day.
  const targetDate = new Date(dateStr);
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const { data, error } = await supabase
    .from('reservations')
    .select('time, duration')
    .gte('time', start.toISOString())
    .lte('time', end.toISOString())
    .neq('status', 'cancelled');

  if (error) {
    console.error('Failed to fetch reservations:', error);
    return [];
  }

  // Expand reservations into 30-minute block ISO strings
  const blockedSlots: string[] = [];

  data.forEach(res => {
    const startTime = new Date(res.time);
    const duration = res.duration || 30; // default to 30 if null
    const blocks = Math.ceil(duration / 30);

    for (let i = 0; i < blocks; i++) {
      const blockTime = new Date(startTime.getTime() + i * 30 * 60 * 1000);
      blockedSlots.push(blockTime.toISOString());
    }
  });

  return blockedSlots;
}

/**
 * Creates a new reservation and handles notifications.
 */
export async function createReservation(time: Date, serviceName: string = '기본 시술', duration: number = 30) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("권한이 없습니다.");

  // Check for conflicts using existing slot logic
  // Since our business logic enforces a 30-min grid, checking against blocked slots is sufficient.
  const todayStr = time.toISOString();
  const blockedSlots = await getReservationsByDate(todayStr);
  const blockedSet = new Set(blockedSlots.map(s => new Date(s).getTime()));

  const blocksNeeded = Math.ceil(duration / 30);
  for (let i = 0; i < blocksNeeded; i++) {
    const checkTime = new Date(time.getTime() + i * 30 * 60 * 1000).getTime();
    if (blockedSet.has(checkTime)) {
      throw new Error("선택하신 시간에 이미 예약이 있습니다.");
    }
  }

  // 1. Insert Reservation
  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      user_id: user.id,
      time: time.toISOString(),
      service_name: serviceName,
      duration: duration,
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
      .select('id, push_subscription')
      .in('role', ['owner', 'admin'])
      .not('push_subscription', 'is', null);

    if (admins?.length) {
      console.log(`[Notification] ${admins.length}명의 관리자/사장님에게 알림을 전송합니다.`);

      const timeStr = time.toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const content = `${user.email}님이 ${timeStr}에 ${serviceName}(${duration}분) 예약을 요청했습니다.`;

      await Promise.allSettled(
        admins.map(async (admin) => {
          await saveNotification(admin.id, '새로운 예약 알림', content, '/admin/reservations');
          if (admin.push_subscription) {
            return sendPushNotification(
              admin.push_subscription,
              '새로운 예약 알림',
              content,
              '/admin/reservations'
            );
          }
        })
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

      const message = `${timeStr} ${serviceName} 예약이 접수되었습니다. 확정 시 다시 알려드릴게요!`;
      await saveNotification(user.id, '예약 접수', message, '/');

      if (currentUserProfile?.push_subscription) {
        await sendPushNotification(
          currentUserProfile.push_subscription,
          '예약 대기 중',
          message,
          '/'
        );
      }
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
    .select('id, user_id, time, status')
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

  // Prevent cancelling confirmed reservations
  if (reservation.status === 'confirmed') {
    throw new Error('이미 확정된 예약은 취소할 수 없습니다. 매장으로 문의해 주세요.');
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
      .select('id, push_subscription')
      .in('role', ['owner', 'admin'])
      .not('push_subscription', 'is', null);

    if (admins?.length) {
      const timeStr = new Date(reservation.time).toLocaleString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      await Promise.allSettled(
        admins.map(async (admin) => {
          await saveNotification(admin.id, '예약 취소 알림', `${user.email}님이 ${timeStr} 예약을 취소했습니다.`, '/admin/reservations');
          if (admin.push_subscription) {
            return sendPushNotification(
              admin.push_subscription,
              '예약 취소 알림',
              `${user.email}님이 ${timeStr} 예약을 취소했습니다.`,
              '/admin/reservations'
            );
          }
        })
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

      await saveNotification(user.id, '예약 취소 완료', `${timeStr} 예약이 정상적으로 취소되었습니다.`, '/my');

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
