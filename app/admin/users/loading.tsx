import loadingStyles from '@/app/loading.module.scss';
import styles from '@/app/home.module.scss';

export default function UsersLoading() {
    return (
        <div className={loadingStyles.cardSkeleton}>
            {/* Title */}
            <div className={loadingStyles.skeleton} style={{ width: '120px', height: '1.25rem', marginBottom: '1.5rem', borderRadius: '4px' }} />

            {/* Desktop Table View - 768px 이상에서만 표시 */}
            <div className={loadingStyles.desktopSkeleton}>
                {/* Table header skeleton */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr 1.5fr 1fr 1fr 0.8fr',
                    gap: '1rem',
                    padding: '1rem',
                    borderBottom: '2px solid var(--border-color, #eee)',
                    marginBottom: '0.5rem'
                }}>
                    <div className={loadingStyles.skeleton} style={{ width: '50px', height: '1rem', borderRadius: '4px' }} />
                    <div className={loadingStyles.skeleton} style={{ width: '60px', height: '1rem', borderRadius: '4px' }} />
                    <div className={loadingStyles.skeleton} style={{ width: '80px', height: '1rem', borderRadius: '4px' }} />
                    <div className={loadingStyles.skeleton} style={{ width: '60px', height: '1rem', borderRadius: '4px' }} />
                    <div className={loadingStyles.skeleton} style={{ width: '50px', height: '1rem', borderRadius: '4px' }} />
                    <div className={loadingStyles.skeleton} style={{ width: '30px', height: '1rem', borderRadius: '4px' }} />
                </div>

                {/* Table rows skeleton */}
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr 1.5fr 1fr 1fr 0.8fr',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color, #eee)',
                            alignItems: 'center'
                        }}
                    >
                        <div className={loadingStyles.skeleton} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        <div className={loadingStyles.skeleton} style={{ width: '80%', height: '1rem', borderRadius: '4px' }} />
                        <div className={loadingStyles.skeleton} style={{ width: '90%', height: '1rem', borderRadius: '4px' }} />
                        <div className={loadingStyles.skeleton} style={{ width: '70%', height: '1rem', borderRadius: '4px' }} />
                        <div className={loadingStyles.skeleton} style={{ width: '100%', height: '36px', borderRadius: '12px' }} />
                        <div className={loadingStyles.skeleton} style={{ width: '80%', height: '1rem', borderRadius: '4px' }} />
                    </div>
                ))}
            </div>

            {/* Mobile Card View - 768px 미만에서 표시 */}
            <div className={loadingStyles.mobileSkeleton}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className={styles.nestItem}
                        style={{ marginBottom: '1.25rem' }}
                    >
                        {/* User Card Main - 아바타와 이름/이메일 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className={loadingStyles.skeleton} style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className={loadingStyles.skeleton} style={{ width: '100px', height: '1.1rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                                <div className={loadingStyles.skeleton} style={{ width: '160px', height: '0.85rem', borderRadius: '4px' }} />
                            </div>
                        </div>

                        {/* User Info Details - 2열 그리드 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem 0.75rem',
                            borderTop: '1px solid var(--border-color, #eee)',
                            paddingTop: '1rem',
                            marginTop: '0.5rem'
                        }}>
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '40px', height: '0.7rem', borderRadius: '2px' }} />
                                    <div className={loadingStyles.skeleton} style={{ width: '80%', height: '0.95rem', borderRadius: '4px' }} />
                                </div>
                            ))}
                        </div>

                        {/* Role Select */}
                        <div style={{ marginTop: '0.5rem' }}>
                            <div className={loadingStyles.skeleton} style={{ width: '50px', height: '0.7rem', marginBottom: '6px', borderRadius: '2px' }} />
                            <div className={loadingStyles.skeleton} style={{ width: '100%', height: '44px', borderRadius: '12px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
