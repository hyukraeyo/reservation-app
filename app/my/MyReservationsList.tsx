'use client';

import { useState, useMemo } from 'react';
import styles from './my.module.scss';
import CancelButton from './CancelButton';
import { ToastContainer, useToast } from '@/app/components/Toast';
import ShowMoreButton from '@/app/components/ShowMoreButton';
import StatusBadge from '@/app/components/StatusBadge';
import FilterSortBar from '@/app/components/FilterSortBar';
import {
    formatReservationDate,
    canCancelReservation,
    FILTER_OPTIONS,
    SORT_OPTIONS,
    FilterType,
    SortType
} from '@/utils/reservation';


interface Reservation {
    id: string;
    time: string;
    status: string;
    created_at?: string;
}

interface MyReservationsListProps {
    initialReservations: Reservation[];
}

export default function MyReservationsList({ initialReservations }: MyReservationsListProps) {
    const { toasts, addToast } = useToast();
    const [displayCount, setDisplayCount] = useState(5);
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('created-desc');

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
        <div className={styles.container}>
            <ToastContainer toasts={toasts} />

            {/* Filter & Sort Controls */}
            {initialReservations.length > 0 && (
                <FilterSortBar
                    filterOptions={FILTER_OPTIONS}
                    currentFilter={filter}
                    onFilterChange={(val) => { setFilter(val); setDisplayCount(5); }}
                    sortOptions={SORT_OPTIONS}
                    currentSort={sort}
                    onSortChange={(val) => setSort(val)}
                />
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
                            const { month, day, weekday, time } = formatReservationDate(reservation.time);
                            const canCancel = canCancelReservation(reservation.status, reservation.time);
                            const isCancelled = reservation.status === 'cancelled';

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
                                            <span className={styles.time}>{time}</span>
                                        </div>

                                        <div className={styles.statusWrapper}>
                                            <StatusBadge status={reservation.status} />
                                        </div>
                                        {reservation.created_at && (
                                            <span className={styles.createdTime}>
                                                신청: {new Date(reservation.created_at).toLocaleString('ko-KR', {
                                                    month: 'numeric',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                })}
                                            </span>
                                        )}
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
        </div>
    );
}

