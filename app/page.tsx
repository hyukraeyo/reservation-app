
'use client'

import { useState, useEffect } from 'react';
import { saveSubscription, createReservation } from './actions';
import { createClient } from '@/utils/supabase/client';
import styles from './home.module.scss';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bookingTime, setBookingTime] = useState('');

  // State for user
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for Service Worker & Push Subscription
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }

    // 2. Fetch User Info to prove login
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    checkUser();
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    // ... (rest of subscribe logic) ...
    const registration = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!vapidKey) return alert('VAPID Key missing');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    await saveSubscription(JSON.parse(JSON.stringify(subscription)));
    setIsSubscribed(true);
    alert('알림 구독이 완료되었습니다!');
  };

  const book = async () => {
    if (!bookingTime) return;
    const date = new Date(bookingTime);
    try {
      await createReservation(date);
      alert('예약되었습니다! 1시간 전에 알림을 보내드릴게요.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert('오류: ' + e.message);
      } else {
        alert('오류가 발생했습니다.');
      }
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <main className={styles.container}>
      {userEmail && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>로그인됨: <strong>{userEmail}</strong></span>
          <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>
            로그아웃
          </button>
        </div>
      )}
      <h1 className={styles.title}>간편 예약</h1>
      
      {!isSubscribed && (
        <button 
          onClick={subscribe}
          className={styles.button}
        >
          알림 받기
        </button>
      )}

      {isSubscribed && (
        <div className={styles.formGroup}>
          <input 
            type="datetime-local" 
            onChange={(e) => setBookingTime(e.target.value)}
          />
          <button 
            onClick={book}
            className={styles.secondaryButton}
          >
            예약하기
          </button>
        </div>
      )}
    </main>
  );
}
