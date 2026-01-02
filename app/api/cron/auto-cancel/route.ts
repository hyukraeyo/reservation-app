import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { saveNotification } from '@/utils/notification';

/**
 * Auto-cancel pending reservations that have passed their scheduled time.
 * Should be called periodically via Vercel Cron or external scheduler.
 */
export async function GET(req: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const now = new Date().toISOString();

        // Find all pending reservations with past time
        const { data: expiredReservations, error: fetchError } = await supabase
            .from('reservations')
            .select('id, user_id, time, service_name')
            .eq('status', 'pending')
            .lt('time', now);

        if (fetchError) {
            console.error('Failed to fetch expired reservations:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
        }

        if (!expiredReservations || expiredReservations.length === 0) {
            return NextResponse.json({ message: 'No expired reservations to cancel', count: 0 });
        }

        // Cancel all expired reservations
        const { error: updateError } = await supabase
            .from('reservations')
            .update({ status: 'cancelled' })
            .eq('status', 'pending')
            .lt('time', now);

        if (updateError) {
            console.error('Failed to cancel expired reservations:', updateError);
            return NextResponse.json({ error: 'Failed to cancel reservations' }, { status: 500 });
        }

        // Notify users about auto-cancellation
        await Promise.allSettled(
            expiredReservations.map(async (res) => {
                const timeStr = new Date(res.time).toLocaleString('ko-KR', {
                    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const message = `${timeStr} 예약이 확정되지 않아 자동 취소되었습니다.`;
                await saveNotification(res.user_id, '예약 자동 취소', message, '/my');
            })
        );

        console.log(`[Auto-Cancel] Cancelled ${expiredReservations.length} expired reservations`);

        return NextResponse.json({
            success: true,
            count: expiredReservations.length,
            message: `Cancelled ${expiredReservations.length} expired reservations`
        });
    } catch (error) {
        console.error('Auto-cancel cron error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
