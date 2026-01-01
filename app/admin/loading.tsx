import styles from './admin.module.scss';
import homeStyles from '@/app/home.module.scss';
import loadingStyles from '@/app/loading.module.scss';
import Card from '@/app/components/Card';

// 정적 메뉴 아이템 - 실제 UI와 동일
const MENU_ITEMS = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        ),
        title: '예약 상세 관리',
        subtitle: '승인, 취소 및 시간 확인',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
        ),
        title: '예약 홈',
        subtitle: '메인 화면으로 이동',
    },
];

export default function AdminLoading() {
    return (
        <div className={styles.container}>
            {/* Stats skeleton - 예약 현황 요약 (실제 Card 컴포넌트 사용) */}
            <Card title="예약 현황 요약">
                <div className={styles.statsGrid}>
                    {/* 실제 statCard 스타일 유지, 숫자만 스켈레톤 */}
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>총 예약</span>
                        <div className={loadingStyles.skeleton} style={{ width: '32px', height: '1.5rem', borderRadius: '4px' }} />
                    </div>
                    <div className={styles.statCard} style={{ borderColor: '#f59e0b' }}>
                        <span className={styles.statLabel}>대기 중</span>
                        <div className={loadingStyles.skeleton} style={{ width: '24px', height: '1.5rem', borderRadius: '4px' }} />
                    </div>
                    <div className={styles.statCard} style={{ borderColor: '#10b981' }}>
                        <span className={styles.statLabel}>확정됨</span>
                        <div className={loadingStyles.skeleton} style={{ width: '24px', height: '1.5rem', borderRadius: '4px' }} />
                    </div>
                </div>
            </Card>

            <div className={styles.mainGrid}>
                {/* Quick menu - 실제 메뉴 UI 그대로 표시 */}
                <Card title="빠른 메뉴">
                    <div className={styles.menuGrid}>
                        {MENU_ITEMS.map((item, index) => (
                            <div key={index} className={styles.menuCard} style={{ opacity: 0.7, pointerEvents: 'none' }}>
                                <div className={styles.menuIcon}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4>{item.title}</h4>
                                    <p>{item.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent reservations - 데이터만 스켈레톤 */}
                <Card
                    title="최근 예약 현황"
                    badge={<span className={styles.liveIndicator} style={{ opacity: 0.5 }}>Live</span>}
                >
                    <div className={styles.liveList}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={styles.liveItem}>
                                <div className={styles.liveInfo}>
                                    {/* 시간 스켈레톤 */}
                                    <div className={loadingStyles.skeleton} style={{ width: '100px', height: '1rem', marginBottom: '4px', borderRadius: '4px' }} />
                                    {/* 이름 스켈레톤 */}
                                    <div className={loadingStyles.skeleton} style={{ width: '60px', height: '0.85rem', borderRadius: '4px' }} />
                                </div>
                                {/* 상태 배지 스켈레톤 */}
                                <div className={loadingStyles.skeleton} style={{ width: '40px', height: '22px', borderRadius: '100px' }} />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
