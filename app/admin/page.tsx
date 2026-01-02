import { getReservations, checkSuperAdmin } from './actions'
import AdminDashboard from './AdminDashboard'

// page.tsx에서 데이터 로딩 - Next.js 공식 권장 패턴
export default async function AdminDashboardPage() {
  // 병렬 데이터 로딩 (Promise.all)
  const [reservations] = await Promise.all([
    getReservations(),
    checkSuperAdmin(),
  ]);

  return (
    <AdminDashboard
      initialReservations={reservations}
    />
  )
}
