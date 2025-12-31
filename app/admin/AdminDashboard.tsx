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
            <Link href="/admin/reservations" className={styles.menuCard}>
              <div className={styles.menuIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div>
                <h4>예약 상세 관리</h4>
                <p>승인, 취소 및 시간 확인</p>
              </div>
            </Link>
            {isSuperAdmin && (
              <Link href="/admin/users" className={styles.menuCard}>
                <div className={styles.menuIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h4>사용자 관리</h4>
                  <p>회원 역할 및 권한 변경</p>
                </div>
              </Link>
            )}
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
