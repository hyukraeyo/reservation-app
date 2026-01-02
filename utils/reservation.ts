/**
 * Reservation utility functions
 */

// Status badge configuration
export const STATUS_CONFIG = {
    pending: { label: '대기 중', color: 'pending' },
    confirmed: { label: '확정', color: 'confirmed' },
    cancelled: { label: '취소됨', color: 'cancelled' },
} as const;

export type ReservationStatus = keyof typeof STATUS_CONFIG;

/**
 * Format reservation date for display
 */
export function formatReservationDate(dateString: string) {
    const date = new Date(dateString);

    return {
        month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: date.getDate(),
        weekday: date.toLocaleString('ko-KR', { weekday: 'short' }),
        time: date.toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        fullDate: date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }),
        dateObj: date,
    };
}

/**
 * Check if reservation time has passed
 */
export function isReservationPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
}

/**
 * Check if user can cancel this reservation
 */
export function canCancelReservation(status: string, dateString: string): boolean {
    return status !== 'cancelled' && status !== 'confirmed' && !isReservationPast(dateString);
}

/**
 * Get status label in Korean
 */
export function getStatusLabel(status: string): string {
    return STATUS_CONFIG[status as ReservationStatus]?.label || status;
}

/**
 * Filter options for reservation list
 */
export const FILTER_OPTIONS = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '대기중' },
    { value: 'confirmed', label: '확정' },
    { value: 'cancelled', label: '취소' },
] as const;

/**
 * Sort options for reservation list
 */
export const SORT_OPTIONS = [
    { value: 'time-asc', label: '예약일 가까운순' },
    { value: 'time-desc', label: '예약일 먼순' },
    { value: 'created-desc', label: '최근 신청순' },
] as const;

export type FilterType = (typeof FILTER_OPTIONS)[number]['value'];
export type SortType = (typeof SORT_OPTIONS)[number]['value'];
