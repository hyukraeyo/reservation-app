
'use server'

import { createClient } from '@/utils/supabase/server';
import { Client } from "@upstash/qstash";

import { sendPushNotification } from '@/utils/push';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

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

  if (error) return { error: error.message };
  return { success: true };
}

export async function getReservationsByDate(dateStr: string) {
  const supabase = await createClient();
  
  // We expect a date string YYYY-MM-DD
  // We need to query the range in UTC.
  // The simplest way to avoid timezone headaches is to query a wide range (e.g. -1 day to +1 day) around the target date
  // and let the client filter the exact matches, OR rely on the database if we stored timestamps carefully.
  // Assuming 'time' column is TIMESTAMPTZ.
  
  // However, simpler approach for now:
  // We accept an ISO string for the start of the day in ANY timezone (provided by client),
  // but better to just accept "2024-12-30" and query purely based on that if possible?
  // No, let's accept the javascript Date string or ISO string from the client which represents the start of the day in their timezone.
  
  const targetDate = new Date(dateStr);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('reservations')
    .select('time')
    .gte('time', startOfDay.toISOString())
    .lte('time', endOfDay.toISOString())
    .neq('status', 'cancelled');

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  return data.map(r => r.time);
}

export async function createReservation(time: Date) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("권한이 없습니다.");

  // Double check availability (Race condition protection)
  const { data: existing } = await supabase
    .from('reservations')
    .select('id')
    .eq('time', time.toISOString())
    .neq('status', 'cancelled')
    .single();

  if (existing) {
    throw new Error("이미 예약된 시간입니다.");
  }

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
  const oneHourBefore = Math.floor(time.getTime() / 1000) - 3600;
  
  // Only schedule if it's in the future
  if (oneHourBefore > Math.floor(Date.now() / 1000)) {
     try {
       await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/reminder`,
        body: { reservation_id: reservation.id },
        notBefore: oneHourBefore,
      });
     } catch (err) {
       console.error("Failed to schedule notification via QStash:", err);
       // We do NOT throw here because the reservation is already created in the DB.
       // Failure to schedule a reminder should not invalidate the booking.
     }
  }

  // 3. Notify Owners/Admins
  try {
    const { data: owners } = await supabase
      .from('profiles')
      .select('push_subscription')
      .in('role', ['owner', 'admin'])
      .not('push_subscription', 'is', null);

    if (owners && owners.length > 0) {
      const formattedTime = new Date(time).toLocaleString('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      await Promise.all(
        owners.map(owner => 
          sendPushNotification(
            owner.push_subscription,
            '새로운 예약 발생!',
            `${user.email}님이 ${formattedTime}에 예약하셨습니다.`,
            '/admin/reservations'
          )
        )
      );
    }
  } catch (err) {
    console.error('Owner notification failed:', err);
  }

  return reservation;
}
