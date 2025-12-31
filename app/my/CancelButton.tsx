'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelMyReservation } from '@/app/actions';
import styles from './my.module.scss';

interface CancelButtonProps {
    reservationId: string;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function CancelButton({ reservationId, addToast }: CancelButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCancel = () => {
        if (!confirm('정말 예약을 취소하시겠습니까?')) return;

        startTransition(async () => {
            try {
                await cancelMyReservation(reservationId);
                addToast('예약이 취소되었습니다.', 'success');
                router.refresh();
            } catch (error) {
                addToast(error instanceof Error ? error.message : '취소 중 오류가 발생했습니다.', 'error');
            }
        });
    };

    return (
        <button
            onClick={handleCancel}
            disabled={isPending}
            className={styles.cancelButton}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {isPending ? '처리 중...' : '예약 취소'}
        </button>
    );
}
