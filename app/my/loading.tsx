import styles from '@/app/home.module.scss';
import myStyles from './my.module.scss';
import loadingStyles from '@/app/loading.module.scss';

export default function MyPageLoading() {
    return (
        <main className={styles.container}>
            {/* Content - 헤더는 Root layout에서 렌더링되므로 제외 */}
            <div className={myStyles.historyCard}>
                {/* Title - 실제 텍스트 그대로 */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
                    내 예약 내역
                </h2>

                {/* Reservation cards skeleton */}
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
                                <div className={myStyles.timeWrapper}>
                                    <svg className={myStyles.timeIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <div className={loadingStyles.skeleton} style={{ width: '60px', height: '1.1rem', borderRadius: '4px' }} />
                                </div>
                                <div className={myStyles.statusWrapper}>
                                    <div className={loadingStyles.skeleton} style={{ width: '60px', height: '26px', borderRadius: '100px' }} />
                                </div>
                            </div>

                            {/* Action Section */}
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
