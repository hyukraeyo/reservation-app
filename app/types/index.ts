export interface Profile {
  id: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin' | null;
}

export interface Reservation {
  id: string;
  user_id: string;
  time: string; // ISO string from Supabase
  created_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  profiles?: {
    email: string | null;
  } | null;
}
