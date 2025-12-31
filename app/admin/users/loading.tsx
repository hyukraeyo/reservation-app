import loadingStyles from '@/app/loading.module.scss';

export default function UsersLoading() {
    return (
        <div className={loadingStyles.cardSkeleton}>
            {/* Title */}
            <div className={loadingStyles.skeleton} style={{ width: '120px', height: '1.25rem', marginBottom: '1.5rem', borderRadius: '4px' }} />

            {/* Table header skeleton */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                padding: '1rem',
                borderBottom: '1px solid var(--border-color, #eee)',
                marginBottom: '0.5rem'
            }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={loadingStyles.skeleton} style={{ width: '70%', height: '1rem', borderRadius: '4px' }} />
                ))}
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1rem',
                        padding: '1rem',
                        borderBottom: '1px solid var(--border-color, #eee)'
                    }}
                >
                    {Array.from({ length: 4 }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className={loadingStyles.skeleton}
                            style={{
                                width: colIndex === 3 ? '100px' : '80%',
                                height: colIndex === 3 ? '36px' : '1rem',
                                borderRadius: colIndex === 3 ? '8px' : '4px'
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
