import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './notifications.module.scss';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    let notifications: any[] = [];
    let errorMsg = null;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        notifications = data || [];
    } catch (err: any) {
        // 테이블이 없는 경우 (42P01: undefined_table)
        if (err.code === '42P01') {
            errorMsg = "알림 기능을 사용하려면 데이터베이스 설정이 필요합니다. (notifications 테이블 없음)";
        } else {
            console.error('Notification Fetch Error:', err);
            // 에러가 나더라도 UI를 깨뜨리지 않고 안내 메시지 표시
            // errorMsg = "알림을 불러오는 중 오류가 발생했습니다."; 
            // 일단 무시하고 빈 목록으로 처리할 수도 있지만, 사용자에게 테이블 생성을 안내하기 위해 표시
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
