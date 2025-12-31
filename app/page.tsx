
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

  // 병렬 데이터 로딩 (Promise.all) - Next.js 공식 권장 패턴
  const today = new Date().toISOString();

  const [profileResult, initialReservedSlots] = await Promise.all([
    // 프로필 조회
    supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single(),
    // 오늘 예약 슬롯 조회
    getReservationsByDate(today),
  ]);

  const profile = profileResult.data;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner';
  const userName = profile?.full_name ?? null;

  return (
    <HomeClient
      initialUserEmail={user.email ?? null}
      initialUserName={userName}
      initialIsAdmin={isAdmin}
      initialReservedSlots={initialReservedSlots}
    />
  );
}
