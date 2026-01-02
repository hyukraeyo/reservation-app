import Link from 'next/link'
import styles from './admin.module.scss'
import Card from '@/app/components/Card'
import LiveReservationList from './LiveReservationList'
import { Reservation } from '@/app/types'

interface AdminDashboardProps {
  initialReservations: Reservation[];
  isSuperAdmin: boolean;
}

// 프레젠테이션 컴포넌트 - 데이터는 page.tsx에서 주입받음
export default function AdminDashboard({
  initialReservations,
  isSuperAdmin
}: AdminDashboardProps) {
  return (
    <div className={styles.container}>
      {/* 통계 현황 */}
      <Card title="예약 현황 요약">
        <LiveReservationList
          initialReservations={initialReservations}
          showStats={true}
          showList={false}
        />
      </Card>

      <div className={styles.mainGrid}>
        {/* 메뉴 링크 섹션 */}
        <Card title="빠른 메뉴">
          <div className={styles.menuGrid}>
            <Link href="/" className={styles.menuCard}>
              <div className={styles.menuIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div>
                <h4>예약 홈</h4>
                <p>메인 화면으로 이동</p>
              </div>
            </Link>
          </div>
        </Card>

        {/* 실시간 현황 섹션 */}
        <Card
          title="최근 예약 현황"
          badge={<span className={styles.liveIndicator}>Live</span>}
        >
          <LiveReservationList
            initialReservations={initialReservations}
            showStats={false}
            showList={true}
          />
        </Card>
      </div>
    </div>
  )
}
