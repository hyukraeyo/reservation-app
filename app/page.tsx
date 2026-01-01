
import HomeClient from './HomeClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getReservationsByDate } from './actions';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 오늘 날짜 기준 예약된 슬롯을 가져옵니다.
  const today = new Date().toISOString();
  const initialReservedSlots = await getReservationsByDate(today);

  return (
    <HomeClient
      initialReservedSlots={initialReservedSlots ?? []}
    />
  );
}
