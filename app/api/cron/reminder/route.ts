
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:example@yourdomain.org',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { reservation_id } = await req.json();

    const supabase = await createClient();
    
    // 1. Get Reservation & User Subscription info
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('*, profiles(push_subscription)')
      .eq('id', reservation_id)
      .single();

    if (resError || !reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const subscription = reservation.profiles?.push_subscription;

    if (!subscription) {
      return NextResponse.json({ message: 'No subscription found' });
    }

    // 2. Send Push Notification
    const payload = JSON.stringify({
      title: 'Reservation Reminder',
      body: `You have a reservation in 1 hour at ${reservation.time}. Please confirm!`,
      url: `/reservations/${reservation_id}`
    });

    await webPush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push Error:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}
