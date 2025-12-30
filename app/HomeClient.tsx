'use client'

import { useState, useEffect } from 'react';
import { saveSubscription, createReservation } from './actions';
import { createClient } from '@/utils/supabase/client';
import styles from './home.module.scss';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import Calendar from '@/app/components/Calendar';
import { useToast, ToastContainer } from '@/app/components/Toast';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface HomeClientProps {
  initialUserEmail: string | null;
  initialIsAdmin: boolean;
}

export default function HomeClient({ initialUserEmail, initialIsAdmin }: HomeClientProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [bookingTime, setBookingTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const router = useRouter();

  const { toasts, addToast, removeToast } = useToast();

  // Use props for initial state
  const userEmail = initialUserEmail;
  const isAdmin = initialIsAdmin;

  useEffect(() => {
    // 1. Check for Service Worker & Push Manager Support
    if ('serviceWorker' in navigator && 'PushManager' in window && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
          setIsLoading(false);
        });
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      // In development or if SW not supported/ready
      setIsLoading(false);
    }
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || isSubscribing) return;

    setIsSubscribing(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        addToast('알림 권한을 허용해야 예약 알림을 받을 수 있습니다.', 'error');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        addToast('VAPID 키가 누락되었습니다.', 'error');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      await saveSubscription(JSON.parse(JSON.stringify(subscription)));
      setIsSubscribed(true);
      addToast('알림 구독이 완료되었습니다!', 'success');
    } catch (e: unknown) {
      console.error(e);
      let message = '알 수 없는 오류';
      if (e instanceof Error) message = e.message;
      addToast('구독 중 오류가 발생했습니다: ' + message, 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  const book = async () => {
    if (!bookingTime || isBooking) return;
    setIsBooking(true);
    const date = new Date(bookingTime);
    try {
      await createReservation(date);
      addToast('예약되었습니다! 1시간 전에 알림을 보내드릴게요.', 'success');
      // 예약 성공 후 슬롯 새로고침
      await handleDateChange(date);
      setBookingTime(''); // 예약 성공 후 입력 초기화
    } catch (e: unknown) {
      if (e instanceof Error) {
        addToast('오류: ' + e.message, 'error');
      } else {
        addToast('예약 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setIsBooking(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const [reservedSlots, setReservedSlots] = useState<string[]>([]);

  // Import dynamically to avoid hydration mismatch if possible, or just use normal import
  // We need to import getReservationsByDate.
  // Wait, imports are at top level. We need to add the import.

  // ... (inside component)

  const handleDateChange = async (date: Date) => {
    // Ideally we fetch for the whole month or just the selected day.
    // The action expects a date string.
    try {
      const { getReservationsByDate } = await import('./actions');
      const slots = await getReservationsByDate(date.toISOString());
      if (slots) {
        setReservedSlots(slots || []);
      }
    } catch (error) {
      console.error("Failed to fetch reserved slots", error);
    }
  };

  // ...

  return (
    <main className={styles.container}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>
      {userEmail && (
        <div className={styles.userInfo}>
          <div>
            <span>로그인됨: <strong>{userEmail}</strong></span>
            {isAdmin && (
              <Link href="/admin" className={styles.adminLink}>
                [관리자 페이지]
              </Link>
            )}
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            로그아웃
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ color: 'var(--text-secondary)' }}>로딩 중...</div>
      ) : (
        <>
          {(!isSubscribed && process.env.NODE_ENV === 'production') ? (
            <button
              onClick={subscribe}
              className={styles.button}
              disabled={isSubscribing}
              style={{ opacity: isSubscribing ? 0.7 : 1 }}
            >
              {isSubscribing ? '구독 중...' : '알림 받기'}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '400px' }}>
              {!isSubscribed && process.env.NODE_ENV === 'development' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '-0.5rem' }}>
                  (개발 모드: 알림 구독 없이 예약 기능을 테스트할 수 있습니다)
                </p>
              )}
              <Calendar
                onSelect={setBookingTime}
                initialValue={bookingTime}
                reservedSlots={reservedSlots}
                onDateChange={handleDateChange}
              />
              <button
                onClick={book}
                disabled={!bookingTime || isBooking}
                className={styles.secondaryButton}
                style={{
                  width: '100%',
                  opacity: (!bookingTime || isBooking) ? 0.6 : 1,
                  cursor: (!bookingTime || isBooking) ? 'not-allowed' : 'pointer'
                }}
              >
                {isBooking ? '처리 중...' : '예약하기'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
