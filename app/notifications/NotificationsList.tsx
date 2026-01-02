'use client';

import { useState } from 'react';
import styles from './notifications.module.scss';
import ShowMoreButton from '@/app/components/ShowMoreButton';
import Card from '@/app/components/Card';

interface Notification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    user_id: string;
    link: string | null;
}

interface NotificationsListProps {
    notifications: Notification[];
}

export default function NotificationsList({ notifications }: NotificationsListProps) {
    const [displayCount, setDisplayCount] = useState(5);

    const visibleNotifications = notifications.slice(0, displayCount);
    const hasMore = notifications.length > displayCount;
    const remainingCount = notifications.length - displayCount;

    if (notifications.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔔</div>
                <p className={styles.emptyTitle}>새로운 알림이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {visibleNotifications.map((n) => (
                <Card key={n.id} className={`${styles.item} ${n.is_read ? styles.read : styles.unread}`}>
                    <div className={styles.title}>{n.title}</div>
                    <div className={styles.message}>{n.message}</div>
                    <div className={styles.time}>{new Date(n.created_at).toLocaleString('ko-KR')}</div>
                </Card>
            ))}

            {hasMore && (
                <ShowMoreButton
                    onClick={() => setDisplayCount(prev => prev + 5)}
                    remainingCount={remainingCount}
                />
            )}
        </div>
    );
}
