import { getMyReservations } from '@/app/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/home.module.scss';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { ToastContainer } from '@/app/components/Toast';
import MyReservationsList from './MyReservationsList';

export default async function MyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const reservations = await getMyReservations();

    return (
        <main className={styles.container}>
            <header className={styles.userInfo} style={{ position: 'absolute' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        뒤로가기
                    </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ThemeToggle />
                </div>
            </header>

            <MyReservationsList initialReservations={reservations} />
        </main>
    );
}
