'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import styles from './admin.module.scss'
import { Reservation } from '@/app/types'

interface LiveReservationListProps {
    initialReservations: Reservation[];
    showStats?: boolean;
    showList?: boolean;
}

export default function LiveReservationList({
    initialReservations,
    showStats = true,
    showList = true
}: LiveReservationListProps) {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const supabase = createClient();

    const fetchReservations = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('reservations')
                .select('*, profiles(email, full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReservations(data as unknown as Reservation[]);
        } catch (err) {
            console.error('Failed to fetch reservations:', err);
        }
    }, [supabase]);

    useEffect(() => {
        // 실시간 업데이트 구독
        const channel = supabase
            .channel('realtime-admin-dashboard')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reservations' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        fetchReservations();
                    } else if (payload.eventType === 'UPDATE') {
                        setReservations(prev => prev.map(res => res.id === payload.new.id ? { ...res, ...payload.new } : res));
                    } else if (payload.eventType === 'DELETE') {
                        setReservations(prev => prev.filter(res => res.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchReservations]);

    const stats = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
    };

    return (
        <>
            {/* 통계 카드 */}
            {showStats && (
                <div className={styles.statsGrid}>
                    <Link href="/admin/reservations" className={styles.statCard}>
                        <span className={styles.statLabel}>총 예약</span>
                        <span className={styles.statValue}>{stats.total}</span>
                    </Link>
                    <Link href="/admin/reservations?status=pending" className={styles.statCard} style={{ borderColor: '#f59e0b' }}>
                        <span className={styles.statLabel}>대기 중</span>
                        <span className={styles.statValue} style={{ color: '#f59e0b' }}>{stats.pending}</span>
                    </Link>
                    <Link href="/admin/reservations?status=confirmed" className={styles.statCard} style={{ borderColor: '#10b981' }}>
                        <span className={styles.statLabel}>확정됨</span>
                        <span className={styles.statValue} style={{ color: '#10b981' }}>{stats.confirmed}</span>
                    </Link>
                </div>
            )}

            {/* 최근 예약 목록 */}
            {showList && (
                <div className={styles.liveList}>
                    {reservations.length > 0 ? (
                        reservations.slice(0, 5).map(res => (
                            <div key={res.id} className={styles.liveItem}>
                                <div className={styles.liveInfo}>
                                    <p className={styles.liveTime}>{new Date(res.time).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className={styles.liveId}>{res.profiles?.full_name || res.profiles?.email?.split('@')[0] || '익명'}</p>
                                    {res.created_at && (
                                        <p className={styles.liveCreatedAt}>
                                            신청: {new Date(res.created_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </p>
                                    )}
                                </div>
                                <span className={`${styles.statusBadge} ${styles[res.status]}`}>
                                    {res.status === 'confirmed' ? '확정' : res.status === 'cancelled' ? '취소' : '대기'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className={styles.empty}>새로운 예약이 없습니다.</p>
                    )}
                    {reservations.length > 5 && (
                        <Link href="/admin/reservations" className={styles.viewMore}>
                            전체 내역 보기 →
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
