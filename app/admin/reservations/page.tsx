import { getReservations } from '../actions'
import ReservationTable from './ReservationTable'
import { Suspense } from 'react'
import { PageSkeleton } from '@/app/components/Skeleton'

export default async function AdminReservationsPage() {
  const reservations = await getReservations()

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReservationTable reservations={reservations} />
    </Suspense>
  )
}
