import styles from './admin.module.scss'
import Card from '@/app/components/Card'
import LiveReservationList from './LiveReservationList'
import { Reservation } from '@/app/types'

interface AdminDashboardProps {
  initialReservations: Reservation[];
}

// 프레젠테이션 컴포넌트 - 데이터는 page.tsx에서 주입받음
export default function AdminDashboard({
  initialReservations
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
