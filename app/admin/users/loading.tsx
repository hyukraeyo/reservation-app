import loadingStyles from '@/app/loading.module.scss';
import styles from '@/app/home.module.scss';
import Card from '@/app/components/Card';

export default function UsersLoading() {
    return (
        <Card title="회원 권한 관리">
            {/* Desktop Table View - 768px 이상에서만 표시 */}
            <div className={loadingStyles.desktopSkeleton}>
                {/* 실제 테이블 헤더 텍스트 표시 */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>프로필</th>
                            <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>이름</th>
                            <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>이메일</th>
                            <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>연락처</th>
                            <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>역할</th>
                            <th style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {/* 프로필 이미지 */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                </td>
                                {/* 이름 */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '70px', height: '1rem', borderRadius: '4px' }} />
                                </td>
                                {/* 이메일 */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '150px', height: '1rem', borderRadius: '4px' }} />
                                </td>
                                {/* 연락처 */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '100px', height: '1rem', borderRadius: '4px' }} />
                                </td>
                                {/* 역할 select */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '120px', height: '32px', borderRadius: '12px' }} />
                                </td>
                                {/* ID */}
                                <td style={{ padding: '0.75rem' }}>
                                    <div className={loadingStyles.skeleton} style={{ width: '70px', height: '1rem', borderRadius: '4px' }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - 768px 미만에서 표시 */}
            <div className={loadingStyles.mobileSkeleton}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.nestItem} style={{ marginBottom: '1rem' }}>
                        {/* User Card Main - 아바타와 이름/이메일 */}
                        <div className={styles.userCardMain}>
                            <div className={loadingStyles.skeleton} style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
                            <div>
                                {/* 이름 */}
                                <div className={loadingStyles.skeleton} style={{ width: '80px', height: '1.1rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                                {/* 이메일 */}
                                <div className={loadingStyles.skeleton} style={{ width: '140px', height: '0.85rem', borderRadius: '4px' }} />
                            </div>
                        </div>

                        {/* User Info Details - 실제 라벨 표시, 데이터만 스켈레톤 */}
                        <div className={styles.userInfoDetails}>
                            <div className={styles.infoItem}>
                                <label>연락처</label>
                                <div className={loadingStyles.skeleton} style={{ width: '100px', height: '0.95rem', borderRadius: '4px' }} />
                            </div>
                            <div className={styles.infoItem}>
                                <label>성별/연령</label>
                                <div className={loadingStyles.skeleton} style={{ width: '80px', height: '0.95rem', borderRadius: '4px' }} />
                            </div>
                            <div className={styles.infoItem}>
                                <label>생일</label>
                                <div className={loadingStyles.skeleton} style={{ width: '90px', height: '0.95rem', borderRadius: '4px' }} />
                            </div>
                            <div className={styles.infoItem}>
                                <label>ID</label>
                                <div className={loadingStyles.skeleton} style={{ width: '70px', height: '0.95rem', borderRadius: '4px' }} />
                            </div>
                        </div>

                        {/* Role Select - 라벨은 표시, select만 스켈레톤 */}
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>권한 설정</label>
                            <div className={loadingStyles.skeleton} style={{ width: '100%', height: '44px', borderRadius: '12px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
