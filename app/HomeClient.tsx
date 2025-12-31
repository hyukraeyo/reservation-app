'use client'

import { useState, useEffect, useTransition, useCallback } from 'react';
import { saveSubscription, createReservation, getReservationsByDate } from './actions';
import { createClient } from '@/utils/supabase/client';
import styles from './home.module.scss';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import Calendar from '@/app/components/Calendar';
import { useToast, ToastContainer } from '@/app/components/Toast';
import { urlBase64ToUint8Array } from '@/utils/helpers';

interface HomeClientProps {
  initialUserEmail: string | null;
  initialIsAdmin: boolean;
}

export default function HomeClient({ initialUserEmail, initialIsAdmin }: HomeClientProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingTime, setBookingTime] = useState('');
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);

  const userEmail = initialUserEmail;
  const isAdmin = initialIsAdmin;

  const [isSubscribing, startSubscribing] = useTransition();
  const [isBooking, startBooking] = useTransition();

  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const handleDateChange = useCallback(async (date: Date) => {
    try {
      const slots = await getReservationsByDate(date.toISOString());
      setReservedSlots(slots || []);
    } catch (error) {
      console.error("Failed to fetch reserved slots", error);
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          return registration.pushManager.getSubscription();
        })
        .then((subscription) => {
          setIsSubscribed(!!subscription);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setTimeout(() => setIsLoading(false), 0);
    }
  }, []);

  const subscribe = () => {
    if (!('serviceWorker' in navigator) || isSubscribing) return;

    startSubscribing(async () => {
      try {
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
        addToast('구독 중 오류가 발생했습니다: ' + (e instanceof Error ? e.message : '알 수 없는 오류'), 'error');
      }
    });
  };

  const book = () => {
    if (!bookingTime || isBooking) return;

    startBooking(async () => {
      const date = new Date(bookingTime);
      try {
        await createReservation(date);
        addToast('예약되었습니다! 1시간 전에 알림을 보내드릴게요.', 'success');
        await handleDateChange(date);
        setBookingTime('');
      } catch (e: unknown) {
        addToast('오류: ' + (e instanceof Error ? e.message : '예약 중 오류가 발생했습니다.'), 'error');
      }
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <main className={styles.container}>
      <ToastContainer toasts={toasts} />

      {userEmail && (
        <div className={styles.userInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.userEmail}>{userEmail}</span>
            {isAdmin && (
              <Link href="/admin" className={styles.adminLink}>
                Admin
              </Link>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />
            <button onClick={handleLogout} className={styles.logoutButton}>
              로그아웃
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="pageLoader">
          <div className="largeSpinner"></div>
          <div className="loadingText">정보를 불러오는 중...</div>
        </div>
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
                  cursor: (!bookingTime || isBooking) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isBooking ? (
                  <>
                    <div className="spinner"></div>
                    <span>처리 중...</span>
                  </>
                ) : '예약하기'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
