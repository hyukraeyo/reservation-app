
'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import styles from './dashboard.module.scss';

interface Reservation {
  id: string;
  time: string;
  status: string;
  user_id: string;
}

export default function Dashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchReservations = async () => {
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .order('time', { ascending: true });
      
      if (data) {
        setReservations(data);
      }
    };

    fetchReservations();

    const channel = supabase
      .channel('realtime-reservations')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log('Update received!', payload);
          setReservations((prev) => 
            prev.map((res) => (res.id === payload.new.id ? (payload.new as Reservation) : res))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reservations' },
        (payload) => {
           setReservations((prev) => [...prev, payload.new as Reservation]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.heading}>예약 관리</h1>
      <div className={styles.grid}>
        {reservations.map((res) => (
          <div key={res.id} className={styles.card}>
            <div>
              <p className={styles.time}>{new Date(res.time).toLocaleString('ko-KR')}</p>
              <p className={styles.id}>ID: {res.id.slice(0, 8)}...</p>
            </div>
            <div className={`${styles.status} ${res.status === 'confirmed' ? styles.confirmed : styles.pending}`}>
              {res.status === 'confirmed' ? '확인됨' : '대기중'}
            </div>
          </div>
        ))}
        {reservations.length === 0 && <p>예약 내역이 없습니다.</p>}
      </div>
    </div>
  );
}
