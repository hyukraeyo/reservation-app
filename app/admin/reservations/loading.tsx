import loadingStyles from '@/app/loading.module.scss';
import styles from '@/app/home.module.scss';
import Card from '@/app/components/Card';

export default function ReservationsLoading() {
    return (
        <Card title="전체 예약 내역">
            {/* Desktop Table View - 768px 이상에서만 표시 */}
            <div className={loadingStyles.desktopSkeleton}>
                {/* 실제 테이블 헤더 텍스트 표시 */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>시간</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>고객 이메일</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>상태</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>예약 ID</th>
                            <th style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {/* 시간 */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '140px', height: '1rem', borderRadius: '4px' }} />
                                </td>
                                {/* 이메일 */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '160px', height: '1rem', borderRadius: '4px' }} />
                                </td>
                                {/* 상태 배지 */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '50px', height: '22px', borderRadius: '12px' }} />
                                </td>
                                {/* 예약 ID */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '70px', height: '1rem', borderRadius: '4px' }} />
                                </td>
                                {/* 관리 버튼 */}
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <div className={loadingStyles.skeleton} style={{ width: '50px', height: '28px', borderRadius: '8px' }} />
                                        <div className={loadingStyles.skeleton} style={{ width: '50px', height: '28px', borderRadius: '8px' }} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - 768px 미만에서 표시 */}
            <div className={loadingStyles.mobileSkeleton}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.nestItem} style={{ marginBottom: '0.75rem' }}>
                        {/* Card Header - 실제 레이아웃과 동일 */}
                        <div className={styles.cardHeader}>
                            <div>
                                {/* 시간 */}
                                <div className={loadingStyles.skeleton} style={{ width: '120px', height: '1.1rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                                {/* 이메일 */}
                                <div className={loadingStyles.skeleton} style={{ width: '150px', height: '0.9rem', borderRadius: '4px' }} />
                            </div>
                            {/* 상태 배지 */}
                            <div className={loadingStyles.skeleton} style={{ width: '40px', height: '22px', borderRadius: '100px' }} />
                        </div>

                        {/* 액션 버튼 영역 */}
                        <div className={styles.cardActions}>
                            <div className={loadingStyles.skeleton} style={{ flex: 1, height: '40px', borderRadius: '10px' }} />
                            <div className={loadingStyles.skeleton} style={{ flex: 1, height: '40px', borderRadius: '10px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
