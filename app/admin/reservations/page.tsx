import { getReservations } from '../actions'
import ReservationTable from './ReservationTable'
import Card from '@/app/components/Card'


export default async function AdminReservationsPage() {
  const reservations = await getReservations()

  return (
    <Card title="전체 예약 내역">
      <ReservationTable reservations={reservations} />
    </Card>
  )
}
