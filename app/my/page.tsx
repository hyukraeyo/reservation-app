import { getMyReservations } from '@/app/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import styles from '@/app/home.module.scss';
import MyReservationsList from './MyReservationsList';

export default async function MyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const reservations = await getMyReservations();

    return (
        <MyReservationsList initialReservations={reservations} />
    );
}
