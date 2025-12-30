
'use server'

import { createClient } from '@/utils/supabase/server';
import { Client } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function saveSubscription(subscription: PushSubscription) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };

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

  if (!user) throw new Error("Unauthorized");

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

  return reservation;
}
