import { getReservations } from '../actions'
import ReservationTable from './ReservationTable'
import Card from '@/app/components/Card'


export default async function AdminReservationsPage() {
  const reservations = await getReservations()

  return (
    <ReservationTable reservations={reservations} />
  )
}
