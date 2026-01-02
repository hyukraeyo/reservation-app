import { STATUS_CONFIG, ReservationStatus } from '@/utils/reservation';
import styles from './StatusBadge.module.scss';

interface StatusBadgeProps {
    status: string;
    variant?: 'default' | 'compact';
}

export default function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status as ReservationStatus] || { label: status, color: 'pending' };

    return (
        <span className={`${styles.badge} ${styles[config.color]} ${variant === 'compact' ? styles.compact : ''}`}>
            {config.label}
        </span>
    );
}
