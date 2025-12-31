import styles from '@/app/home.module.scss';
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
            <div style={{ paddingTop: '120px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Title skeleton */}
                <div className={loadingStyles.skeleton} style={{ width: '160px', height: '1.75rem', borderRadius: '4px', marginBottom: '0.5rem' }} />

                {/* Reservation cards skeleton */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className={loadingStyles.cardSkeleton}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className={loadingStyles.skeleton} style={{ width: '140px', height: '1.25rem', borderRadius: '4px' }} />
                            <div className={loadingStyles.skeleton} style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
                        </div>
                        <div className={loadingStyles.skeleton} style={{ width: '100px', height: '0.875rem', borderRadius: '4px' }} />
                        <div className={loadingStyles.skeleton} style={{ width: '80px', height: '0.875rem', borderRadius: '4px' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <div className={loadingStyles.skeleton} style={{ width: '80px', height: '36px', borderRadius: '8px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
