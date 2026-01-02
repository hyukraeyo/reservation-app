export interface Profile {
  id: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin' | null;
  name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  gender?: string | null;
  age_range?: string | null;
  birthday?: string | null;
  birthyear?: string | null;
  memo?: string | null;
  created_at?: string | null;
}

export interface Reservation {
  id: string;
  user_id: string;
  time: string; // ISO string from Supabase
  created_at: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  profiles?: {
    email: string | null;
    full_name?: string | null;
  } | null;
}
