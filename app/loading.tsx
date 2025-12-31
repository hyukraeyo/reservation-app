import styles from './home.module.scss';
import loadingStyles from './loading.module.scss';

export default function Loading() {
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
            <div style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Date picker skeleton */}
                <div className={loadingStyles.skeleton} style={{ width: '100%', height: '280px', borderRadius: '16px' }} />

                {/* Time slots skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className={loadingStyles.skeleton}
                            style={{ height: '44px', borderRadius: '8px' }}
                        />
                    ))}
                </div>

                {/* Service selection skeleton */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className={loadingStyles.skeleton}
                            style={{ height: '72px', borderRadius: '12px' }}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
