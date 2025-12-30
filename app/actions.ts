
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

export async function createReservation(time: Date) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("권한이 없습니다.");

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
     await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cron/reminder`,
      body: { reservation_id: reservation.id },
      notBefore: oneHourBefore,
    });
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
