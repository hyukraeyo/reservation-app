import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function AdminLoading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            width: '100%'
        }}>
            <LoadingSpinner size="large" />
        </div>
    );
}
