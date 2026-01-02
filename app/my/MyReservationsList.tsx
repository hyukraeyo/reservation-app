'use client';

import { useState, useMemo } from 'react';
import styles from './my.module.scss';
import CancelButton from './CancelButton';
import { ToastContainer, useToast } from '@/app/components/Toast';
import ShowMoreButton from '@/app/components/ShowMoreButton';

interface Reservation {
    id: string;
    time: string;
    status: string;
    created_at?: string;
}

interface MyReservationsListProps {
    initialReservations: Reservation[];
}

type FilterType = 'all' | 'pending' | 'confirmed' | 'cancelled';
type SortType = 'time-asc' | 'time-desc' | 'created-desc';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '대기중' },
    { value: 'confirmed', label: '확정' },
    { value: 'cancelled', label: '취소' },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
    { value: 'time-asc', label: '예약일 가까운순' },
    { value: 'time-desc', label: '예약일 먼순' },
    { value: 'created-desc', label: '최근 신청순' },
];

export default function MyReservationsList({ initialReservations }: MyReservationsListProps) {
    const { toasts, addToast } = useToast();
    const now = new Date();
    const [displayCount, setDisplayCount] = useState(5);
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('time-asc');

    // Filter and sort reservations
    const filteredReservations = useMemo(() => {
        let result = [...initialReservations];

        // Apply filter
        if (filter !== 'all') {
            result = result.filter(r => r.status === filter);
        }

        // Apply sort
        result.sort((a, b) => {
            if (sort === 'time-asc') {
                return new Date(a.time).getTime() - new Date(b.time).getTime();
            } else if (sort === 'time-desc') {
                return new Date(b.time).getTime() - new Date(a.time).getTime();
            } else {
                // created-desc
                const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
                return bCreated - aCreated;
            }
        });

        return result;
    }, [initialReservations, filter, sort]);

    const visibleReservations = filteredReservations.slice(0, displayCount);
    const hasMore = filteredReservations.length > displayCount;
    const remainingCount = filteredReservations.length - displayCount;

    return (
        <>
            <ToastContainer toasts={toasts} />

            {/* Filter & Sort Controls */}
            {initialReservations.length > 0 && (
                <div className={styles.filterSection}>
                    <div className={styles.filterChips}>
                        {FILTER_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                className={`${styles.filterChip} ${filter === option.value ? styles.active : ''}`}
                                onClick={() => { setFilter(option.value); setDisplayCount(5); }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <select
                        className={styles.sortSelect}
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortType)}
                    >
                        {SORT_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.historyCard}>
                {filteredReservations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📅</div>
                        <p className={styles.emptyTitle}>
                            {filter !== 'all' ? '해당 조건의 예약이 없습니다.' : '아직 예약된 내역이 없습니다.'}
                        </p>
                        <p className={styles.emptyDesc}>
                            {filter !== 'all' ? '다른 필터를 선택해보세요.' : '원하는 시간에 예약을 진행해보세요!'}
                        </p>
                    </div>
                ) : (
                    <div className={styles.listContainer}>
                        {visibleReservations.map((reservation) => {
                            const reservationDate = new Date(reservation.time);
                            const isPast = reservationDate < now;
                            const canCancel = reservation.status !== 'cancelled' && reservation.status !== 'confirmed' && !isPast;
                            const isCancelled = reservation.status === 'cancelled';
                            const isConfirmed = reservation.status === 'confirmed';

                            // Date formatting parts
                            const month = reservationDate.toLocaleString('en-US', { month: 'short' });
                            const day = reservationDate.getDate();
                            const weekday = reservationDate.toLocaleString('ko-KR', { weekday: 'short' });
                            const timeStr = reservationDate.toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={reservation.id} className={`${styles.reservationCard} ${isCancelled ? styles.cancelled : ''}`}>
                                    {/* Left: Date Block */}
                                    <div className={styles.dateSection}>
                                        <span className={styles.month}>{month}</span>
                                        <span className={styles.day}>{day}</span>
                                        <span className={styles.weekday}>{weekday}</span>
                                    </div>

                                    {/* Middle: Info */}
                                    <div className={styles.infoSection}>
                                        <div className={styles.timeWrapper}>
                                            <svg className={styles.timeIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polyline points="12 6 12 12 16 14"></polyline>
                                            </svg>
                                            <span className={styles.time}>{timeStr}</span>
                                        </div>

                                        <div className={styles.statusWrapper}>
                                            <span className={`${styles.statusBadge} ${isConfirmed ? styles.confirmed : isCancelled ? styles.cancelled : styles.pending}`}>
                                                {isConfirmed ? '예약 확정' : isCancelled ? '취소됨' : '대기 중'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Action */}
                                    <div className={styles.actionSection}>
                                        {canCancel && <CancelButton reservationId={reservation.id} addToast={addToast} />}
                                    </div>
                                </div>
                            );
                        })}

                        {hasMore && (
                            <ShowMoreButton
                                onClick={() => setDisplayCount(prev => prev + 5)}
                                remainingCount={remainingCount}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

