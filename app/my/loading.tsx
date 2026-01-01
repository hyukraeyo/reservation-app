import styles from '@/app/home.module.scss';
import myStyles from './my.module.scss';
import loadingStyles from '@/app/loading.module.scss';

export default function MyPageLoading() {
    return (
        <main className={styles.container}>
            {/* Header skeleton */}
            <header className={styles.userInfo} style={{ position: 'absolute' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={loadingStyles.skeleton} style={{ width: '100px', height: '24px', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={loadingStyles.skeleton} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                </div>
            </header>

            {/* Content skeleton */}
            <div className={myStyles.historyCard} style={{ paddingTop: '120px' }}>
                {/* Title skeleton */}
                <div className={loadingStyles.skeleton} style={{ width: '160px', height: '1.75rem', borderRadius: '4px', marginBottom: '1.5rem', marginLeft: '0.5rem' }} />

                {/* Reservation cards skeleton - 실제 UI와 동일한 구조 */}
                <div className={myStyles.listContainer}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={myStyles.reservationCard}>
                            {/* Date Section */}
                            <div className={myStyles.dateSection}>
                                <div className={loadingStyles.skeleton} style={{ width: '30px', height: '0.75rem', borderRadius: '2px' }} />
                                <div className={loadingStyles.skeleton} style={{ width: '40px', height: '1.8rem', borderRadius: '4px', margin: '4px 0' }} />
                                <div className={loadingStyles.skeleton} style={{ width: '24px', height: '0.75rem', borderRadius: '2px' }} />
                            </div>

                            {/* Info Section */}
                            <div className={myStyles.infoSection}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                                    <div className={loadingStyles.skeleton} style={{ width: '80px', height: '1.2rem', borderRadius: '4px' }} />
                                </div>
                                <div className={loadingStyles.skeleton} style={{ width: '70px', height: '28px', borderRadius: '100px', marginTop: '0.25rem' }} />
                            </div>

                            {/* Action Section (모바일에서는 다른 위치) */}
                            <div className={myStyles.actionSection}>
                                <div className={loadingStyles.skeleton} style={{ width: '80px', height: '40px', borderRadius: '14px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
