import LoadingPage from '@/app/components/LoadingPage';
import styles from '@/app/home.module.scss';

export default function MyPageLoading() {
    return (
        <main className={styles.container}>
            <LoadingPage style={{ backgroundColor: 'transparent' }} />
        </main>
    );
}
