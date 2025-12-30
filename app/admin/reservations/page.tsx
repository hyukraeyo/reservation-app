import { getReservations } from '../actions'
import ReservationTable from './ReservationTable'
import Link from 'next/link'

export default async function AdminReservationsPage() {
  const reservations = await getReservations()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>예약 관리</h2>
          <p style={{ color: 'var(--text-secondary)' }}>모든 고객의 예약 내역을 확인하고 관리합니다.</p>
        </div>
        <Link 
            href="/admin" 
            style={{ 
                textDecoration: 'none', 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem',
                border: '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '4px'
            }}
        >
            대시보드로 돌아가기
        </Link>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
        <ReservationTable reservations={reservations} />
      </div>
    </div>
  )
}
