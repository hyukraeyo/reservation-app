import loadingStyles from '@/app/loading.module.scss';

export default function ReservationsLoading() {
    return (
        <div className={loadingStyles.cardSkeleton}>
            {/* Title */}
            <div className={loadingStyles.skeleton} style={{ width: '140px', height: '1.25rem', marginBottom: '1.5rem', borderRadius: '4px' }} />

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
            {Array.from({ length: 8 }).map((_, rowIndex) => (
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
    );
}
