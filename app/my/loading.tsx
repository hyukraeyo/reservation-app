import LoadingSpinner from '@/app/components/LoadingSpinner';
import styles from '@/app/home.module.scss';

export default function MyPageLoading() {
    return (
        <main className={styles.container}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                width: '100%'
            }}>
                <LoadingSpinner size="large" />
            </div>
        </main>
    );
}
