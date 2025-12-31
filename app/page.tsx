
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
  let userName = null;

  if (user.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.role === 'admin' || profile.role === 'owner') {
        isAdmin = true;
      }
      userName = profile.full_name;
    }
  }

  // Pre-fetch today's reservations
  const today = new Date().toISOString();
  const initialReservedSlots = await getReservationsByDate(today);

  return (
    <HomeClient
      initialUserEmail={user.email ?? null}
      initialUserName={userName}
      initialIsAdmin={isAdmin}
      initialReservedSlots={initialReservedSlots}
    />
  );
}
