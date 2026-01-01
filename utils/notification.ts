import { createClient } from '@/utils/supabase/server';

export async function saveNotification(userId: string, title: string, message: string, link: string = '/') {
    const supabase = await createClient();
    try {
        await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            link
        });
    } catch (error) {
        console.warn('Failed to save notification to DB:', error);
    }
}
