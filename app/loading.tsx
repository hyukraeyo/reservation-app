import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100%',
            backgroundColor: 'var(--bg-color)',
        }}>
            <LoadingSpinner size="large" />
        </div>
    );
}
