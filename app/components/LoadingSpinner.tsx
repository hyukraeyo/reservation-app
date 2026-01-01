'use client';

import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
}

export default function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
    return (
        <div className={`${styles.container} ${styles[size]}`}>
            <div className={styles.balls}>
                <div className={styles.ball} />
                <div className={styles.ball} />
                <div className={styles.ball} />
            </div>
            {text && <p className={styles.text}>{text}</p>}
        </div>
    );
}
