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

  return reservation;
}
