'use client';

import styles from './ShowMoreButton.module.scss';

interface ShowMoreButtonProps {
    onClick: () => void;
    remainingCount: number;
    label?: string;
}

export default function ShowMoreButton({ onClick, remainingCount, label = '더보기' }: ShowMoreButtonProps) {
    return (
        <button className={styles.showMoreButton} onClick={onClick}>
            <span>{label}</span>
            <span className={styles.count}>({remainingCount}개)</span>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </button>
    );
}
