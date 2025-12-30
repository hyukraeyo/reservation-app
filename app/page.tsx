import HomeClient from './HomeClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should have caught this, but double check
    redirect('/login');
  }

  let isAdmin = false;

  if (user.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role === 'admin') {
      isAdmin = true;
    }
  }

  return (
    <HomeClient 
      initialUserEmail={user.email ?? null} 
      initialIsAdmin={isAdmin} 
    />
  );
}
