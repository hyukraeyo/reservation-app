import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/utils/push';

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

    // Skip if not confirmed (only remind for confirmed reservations)
    if (reservation.status !== 'confirmed') {
      return NextResponse.json({ message: 'Reservation not confirmed, skipping notification' });
    }

    const subscription = reservation.profiles?.push_subscription;

    if (!subscription) {
      return NextResponse.json({ message: 'No subscription found' });
    }

    // 2. Send Push Notification
    await sendPushNotification(
      subscription,
      '예약 리마인더',
      `1시간 후에 예약(${new Date(reservation.time).toLocaleTimeString('ko-KR')})이 있습니다. 확인해 주세요!`,
      `/`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push Error:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}
