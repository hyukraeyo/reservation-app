'use client';

import styles from './my.module.scss';
import CancelButton from './CancelButton';
import { ToastContainer, useToast } from '@/app/components/Toast';

interface Reservation {
    id: string;
    time: string;
    status: string;
}

interface MyReservationsListProps {
    initialReservations: Reservation[];
}

export default function MyReservationsList({ initialReservations }: MyReservationsListProps) {
    const { toasts, addToast } = useToast();
    const now = new Date();

    return (
        <>
            <ToastContainer toasts={toasts} />
            <div className={styles.historyCard}>
                <h2 className={styles.header}>내 예약 내역</h2>
                {initialReservations.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📅</div>
                        <p className={styles.emptyTitle}>아직 예약된 내역이 없습니다.</p>
                        <p className={styles.emptyDesc}>원하는 시간에 예약을 진행해보세요!</p>
                    </div>
                ) : (
                    <div className={styles.listContainer}>
                        {initialReservations.map((reservation) => {
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
                    </div>
                )}
            </div>
        </>
    );
}
