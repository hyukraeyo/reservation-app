import loadingStyles from '@/app/loading.module.scss';
import styles from '@/app/home.module.scss';

export default function ReservationsLoading() {
    return (
        <div className={loadingStyles.cardSkeleton}>
            {/* Title */}
            <div className={loadingStyles.skeleton} style={{ width: '140px', height: '1.25rem', marginBottom: '1.5rem', borderRadius: '4px' }} />

            {/* Desktop Table View - 768px 이상에서만 표시 */}
            <div className={loadingStyles.desktopSkeleton}>
                {/* Table header skeleton */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-color, #eee)',
                    marginBottom: '0.5rem'
                }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={loadingStyles.skeleton} style={{ width: '80%', height: '1rem', borderRadius: '4px' }} />
                    ))}
                </div>

                {/* Table rows skeleton */}
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '1rem',
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color, #eee)'
                        }}
                    >
                        {Array.from({ length: 5 }).map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className={loadingStyles.skeleton}
                                style={{
                                    width: colIndex === 4 ? '60px' : '70%',
                                    height: colIndex === 4 ? '32px' : '1rem',
                                    borderRadius: colIndex === 4 ? '16px' : '4px'
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Mobile Card View - 768px 미만에서 표시 */}
            <div className={loadingStyles.mobileSkeleton}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className={styles.nestItem}
                        style={{ marginBottom: '1rem' }}
                    >
                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className={loadingStyles.skeleton} style={{ width: '140px', height: '1.25rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                                <div className={loadingStyles.skeleton} style={{ width: '180px', height: '0.9rem', borderRadius: '4px' }} />
                            </div>
                            <div className={loadingStyles.skeleton} style={{ width: '50px', height: '24px', borderRadius: '100px' }} />
                        </div>

                        {/* Card Actions (승인/취소 버튼) */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <div className={loadingStyles.skeleton} style={{ flex: 1, height: '40px', borderRadius: '10px' }} />
                            <div className={loadingStyles.skeleton} style={{ flex: 1, height: '40px', borderRadius: '10px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
