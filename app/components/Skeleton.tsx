import styles from './Skeleton.module.scss';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    className?: string;
    count?: number;
}

export function Skeleton({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1,
}: SkeletonProps) {
    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${styles.skeleton} ${styles[variant]} ${className}`}
            style={{
                width: width ?? (variant === 'text' ? '100%' : undefined),
                height: height ?? (variant === 'text' ? '1em' : undefined),
            }}
        />
    ));

    return <>{skeletons}</>;
}

// 예약 카드 스켈레톤
export function ReservationCardSkeleton() {
    return (
        <div className={styles.cardSkeleton}>
            <div className={styles.cardHeader}>
                <Skeleton variant="text" width="60%" height="1.2rem" />
                <Skeleton variant="rectangular" width="60px" height="24px" />
            </div>
            <Skeleton variant="text" width="80%" height="0.9rem" />
            <Skeleton variant="text" width="40%" height="0.9rem" />
        </div>
    );
}

// 대시보드 통계 스켈레톤
export function StatCardSkeleton() {
    return (
        <div className={styles.statSkeleton}>
            <Skeleton variant="text" width="50%" height="0.9rem" />
            <Skeleton variant="text" width="30%" height="1.8rem" />
        </div>
    );
}

// 메뉴 카드 스켈레톤
export function MenuCardSkeleton() {
    return (
        <div className={styles.menuSkeleton}>
            <Skeleton variant="circular" width="48px" height="48px" />
            <div className={styles.menuContent}>
                <Skeleton variant="text" width="70%" height="1rem" />
                <Skeleton variant="text" width="90%" height="0.8rem" />
            </div>
        </div>
    );
}

// 테이블 행 스켈레톤
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <div className={styles.tableRow}>
            {Array.from({ length: columns }, (_, i) => (
                <Skeleton key={i} variant="text" width="80%" height="1rem" />
            ))}
        </div>
    );
}

// 페이지 로딩 스켈레톤
export function PageSkeleton() {
    return (
        <div className={styles.pageSkeleton}>
            <Skeleton variant="text" width="200px" height="2rem" />
            <div className={styles.pageContent}>
                <Skeleton variant="rectangular" width="100%" height="200px" />
            </div>
        </div>
    );
}
