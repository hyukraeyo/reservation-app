
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

  let isAdmin = false;

  if (user.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin' || profile?.role === 'owner') {
      isAdmin = true;
    }
  }

  // Pre-fetch today's reservations
  const today = new Date().toISOString();
  const initialReservedSlots = await getReservationsByDate(today);

  return (
    <HomeClient
      initialUserEmail={user.email ?? null}
      initialIsAdmin={isAdmin}
      initialReservedSlots={initialReservedSlots}
    />
  );
}
