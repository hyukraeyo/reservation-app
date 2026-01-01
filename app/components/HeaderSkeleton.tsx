import loadingStyles from '@/app/loading.module.scss'

export default function HeaderSkeleton() {
    return (
        <div style={{
            position: 'fixed',
            top: '1.25rem',
            left: '1.25rem',
            right: '1.25rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '100px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            zIndex: 1000,
        }}>
            <div className={loadingStyles.skeleton} style={{ width: '80px', height: '18px', borderRadius: '4px' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className={loadingStyles.skeleton} style={{ width: '50px', height: '22px', borderRadius: '100px' }} />
                <div className={loadingStyles.skeleton} style={{ width: '50px', height: '22px', borderRadius: '100px' }} />
            </div>
        </div>
    )
}
