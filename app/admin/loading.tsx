import styles from './admin.module.scss';
import homeStyles from '@/app/home.module.scss';
import loadingStyles from '@/app/loading.module.scss';

export default function AdminLoading() {
    return (
        <div className={styles.container}>
            {/* Stats skeleton - 예약 현황 요약 */}
            <div className={loadingStyles.cardSkeleton} style={{ marginBottom: '1.5rem' }}>
                <div className={loadingStyles.skeleton} style={{ width: '140px', height: '1.25rem', marginBottom: '1rem', borderRadius: '4px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color, #eee)' }}>
                            <div className={loadingStyles.skeleton} style={{ width: '60px', height: '0.875rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                            <div className={loadingStyles.skeleton} style={{ width: '40px', height: '1.5rem', borderRadius: '4px' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main grid skeleton - 반응형 */}
            <div className={styles.mainGrid}>
                {/* Quick menu skeleton - 빠른 메뉴 */}
                <div className={loadingStyles.cardSkeleton}>
                    <div className={loadingStyles.skeleton} style={{ width: '100px', height: '1.25rem', marginBottom: '1rem', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={homeStyles.nestItem} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                                <div className={loadingStyles.skeleton} style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '80%', height: '1rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                                    <div className={loadingStyles.skeleton} style={{ width: '60%', height: '0.75rem', borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent reservations skeleton - 최근 예약 현황 */}
                <div className={loadingStyles.cardSkeleton}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className={loadingStyles.skeleton} style={{ width: '120px', height: '1.25rem', borderRadius: '4px' }} />
                        <div className={loadingStyles.skeleton} style={{ width: '40px', height: '20px', borderRadius: '10px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={homeStyles.nestItem} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem' }}>
                                <div>
                                    <div className={loadingStyles.skeleton} style={{ width: '120px', height: '1rem', marginBottom: '0.25rem', borderRadius: '4px' }} />
                                    <div className={loadingStyles.skeleton} style={{ width: '80px', height: '0.75rem', borderRadius: '4px' }} />
                                </div>
                                <div className={loadingStyles.skeleton} style={{ width: '50px', height: '24px', borderRadius: '12px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
