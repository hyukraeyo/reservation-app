'use client';

import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import { saveSubscription, createReservation, getReservationsByDate } from './actions';
import { createClient } from '@/utils/supabase/client';
import styles from './home.module.scss';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import Calendar from '@/app/components/Calendar';
import { useToast, ToastContainer } from '@/app/components/Toast';
import { urlBase64ToUint8Array } from '@/utils/helpers';

const SERVICES = [
  { id: 'moisture_perm', name: '수분펌', duration: 60, price: '40,000원' },
  { id: 'air_flat', name: '에어플랫모', duration: 60, price: '60,000원' },
  { id: 'perm_point', name: '펌포인트래쉬', duration: 30, price: '30,000원' },
  { id: 'perm_ext', name: '펌연장', duration: 90, price: '80,000원' },
  { id: 'gel_nail', name: '젤네일', duration: 60, price: '50,000원' },
  { id: 'gel_pedi', name: '젤패디', duration: 60, price: '60,000원' },
];

interface HomeClientProps {
  initialUserEmail: string | null;
  initialUserName: string | null;
  initialIsAdmin: boolean;
  initialReservedSlots: string[];
}

export default function HomeClient({ initialUserEmail, initialUserName, initialIsAdmin, initialReservedSlots = [] }: HomeClientProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingTime, setBookingTime] = useState('');
  const [reservedSlots, setReservedSlots] = useState<string[]>(initialReservedSlots);
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userEmail = initialUserEmail;
  const userName = initialUserName;
  const isAdmin = initialIsAdmin;

  const [isSubscribing, startSubscribing] = useTransition();
  const [isBooking, startBooking] = useTransition();

  const router = useRouter();
  const { toasts, addToast } = useToast();

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
        await createReservation(date, selectedService.name, selectedService.duration);
        addToast(`${selectedService.name} 예약이 완료되었습니다! 1시간 전에 알림을 보내드릴게요.`, 'success');
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
        <div className={`${styles.userInfo} ${!showHeader ? styles.headerHidden : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.userEmail}>{userName || userEmail.split('@')[0]}님</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/my" className={styles.myPageLink}>
              내 예약
            </Link>
            {isAdmin && (
              <Link href="/admin" className={styles.adminLink}>
                Admin
              </Link>
            )}

            {/* <ThemeToggle /> */}

            {process.env.NODE_ENV === 'development' && (
              <button onClick={handleLogout} className={styles.logoutButton}>
                로그아웃
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className={styles.contentLoader}>
          <div className="largeSpinner"></div>
          <div className="loadingText">예약 가능 여부를 확인하고 있습니다...</div>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '400px', paddingBottom: '40px' }}>
              {/* Service Selection UI */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setBookingTime(''); // Reset time when service changes
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: selectedService.id === service.id ? '1px solid var(--primary-color)' : '1px solid transparent',
                      background: 'var(--bg-card)',
                      color: selectedService.id === service.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: selectedService.id === service.id
                        ? '0 0 0 1px var(--primary-color), 0 4px 12px rgba(0,0,0,0.05)'
                        : 'var(--shadow-sm)',
                      transform: selectedService.id === service.id ? 'translateY(-2px)' : 'none',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: selectedService.id === service.id ? 'currentColor' : 'var(--text-main)' }}>{service.name}</span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500 }}>{service.duration}분</span>
                  </button>
                ))}
              </div>

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
                duration={selectedService.duration}
              />
              <div
                className={styles.floatingActionContainer}
                style={{
                  transform: bookingTime ? 'translateY(0)' : 'translateY(2rem)',
                  opacity: bookingTime ? 1 : 0,
                  visibility: bookingTime ? 'visible' : 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <button
                  onClick={book}
                  disabled={!bookingTime || isBooking}
                  className={styles.floatingButton}
                  style={{
                    opacity: isBooking ? 0.8 : 1,
                    cursor: isBooking ? 'wait' : 'pointer',
                  }}
                >
                  {isBooking ? (
                    <>
                      <div className="spinner"></div>
                      <span>처리 중...</span>
                    </>
                  ) : `${selectedService.name} 예약하기`}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* <ThemeToggle className={styles.floatingThemeToggle} /> */}
    </main>
  );
}
