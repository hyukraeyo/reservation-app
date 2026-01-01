import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './notifications.module.scss';

export const dynamic = 'force-dynamic';

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    user_id: string;
    link: string | null;
}

export default async function NotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    let notifications: Notification[] = [];
    let errorMsg = null;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notifications = (data as any) || [];
    } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;

        // 테이블이 없는 경우 (42P01: undefined_table) 또는 에러 메시지에 'does not exist'가 포함된 경우
        const errorMessage = error.message || JSON.stringify(error);
        if (error.code === '42P01' || errorMessage.includes('does not exist') || errorMessage.includes('notifications')) {
            errorMsg = "알림 기능을 사용하려면 데이터베이스 설정이 필요합니다.\n(notifications 테이블이 없습니다)";
        } else {
            console.error('Notification Fetch Error:', error);
            errorMsg = `알림을 불러오는 중 오류가 발생했습니다.\n${errorMessage}`;
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>알림함</h1>
                <Link href="/" className={styles.backLink}>메인으로</Link>
            </header>

            {errorMsg ? (
                <div className={styles.empty} style={{ whiteSpace: 'pre-wrap' }}>
                    {errorMsg}
                    {'\n\n'}
                    (개발자 노트: schema_notifications.sql 파일을 참조하여 테이블을 생성해주세요)
                </div>
            ) : notifications.length === 0 ? (
                <div className={styles.empty}>새로운 알림이 없습니다.</div>
            ) : (
                <div className={styles.list}>
                    {notifications.map((n) => (
                        <div key={n.id} className={`${styles.item} ${n.is_read ? styles.read : styles.unread}`}>
                            <div className={styles.title}>{n.title}</div>
                            <div className={styles.message}>{n.message}</div>
                            <div className={styles.time}>{new Date(n.created_at).toLocaleString('ko-KR')}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
