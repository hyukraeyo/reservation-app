import { getReservations } from '../actions'
import ReservationTable from './ReservationTable'
import { Suspense } from 'react'

export default async function AdminReservationsPage() {
  const reservations = await getReservations()

  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading filters...</div>}>
      <ReservationTable reservations={reservations} />
    </Suspense>
  )
}
