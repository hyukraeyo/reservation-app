import styles from './home.module.scss';
import loadingStyles from './loading.module.scss';

export default function Loading() {
    return (
        <main className={styles.container}>
            {/* Header skeleton */}
            <header className={styles.userInfo} style={{ position: 'absolute' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={loadingStyles.skeleton} style={{ width: '80px', height: '20px', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={loadingStyles.skeleton} style={{ width: '50px', height: '24px', borderRadius: '100px' }} />
                    <div className={loadingStyles.skeleton} style={{ width: '50px', height: '24px', borderRadius: '100px' }} />
                </div>
            </header>

            {/* Content skeleton */}
            <div style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '400px' }}>
                {/* Service Selection skeleton - 2열 그리드 */}
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className={loadingStyles.skeleton}
                            style={{
                                height: '72px',
                                borderRadius: '16px',
                            }}
                        />
                    ))}
                </div>

                {/* Calendar skeleton */}
                <div className={loadingStyles.skeleton} style={{ width: '100%', height: '320px', borderRadius: '16px' }} />

                {/* Time slots는 날짜 선택 후 표시되므로 스켈레톤에서 제외 */}
            </div>
        </main>
    );
}
