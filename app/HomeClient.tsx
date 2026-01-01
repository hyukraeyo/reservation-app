'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { saveSubscription, createReservation, getReservationsByDate } from './actions';
import styles from './home.module.scss';
import { useRouter } from 'next/navigation';
import Calendar from '@/app/components/Calendar';
import { useToast, ToastContainer } from '@/app/components/Toast';
import { urlBase64ToUint8Array } from '@/utils/helpers';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { SERVICE_LIST } from '@/app/constants';




interface HomeClientProps {
  initialUserEmail: string | null;
  initialUserName: string | null;
  initialIsAdmin: boolean;
  initialReservedSlots: string[];
}

export default function HomeClient({ initialUserEmail, initialUserName, initialIsAdmin, initialReservedSlots = [] }: HomeClientProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  // 초기 로딩을 false로 설정 - 컨텐츠 즉시 표시
  const [isLoading, setIsLoading] = useState(false);
  const [bookingTime, setBookingTime] = useState('');
  const [reservedSlots, setReservedSlots] = useState<string[]>(initialReservedSlots);
  const [selectedService, setSelectedService] = useState(SERVICE_LIST[0]);

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

  // Service Worker 초기화 (백그라운드에서 비동기 처리)
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => setIsSubscribed(!!subscription))
        .catch((error) => console.error('Service Worker registration failed:', error));
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

  return (
    <main className={styles.container}>
      <ToastContainer toasts={toasts} />



      {isLoading ? (
        <div className={styles.contentLoader}>
          <LoadingSpinner size="medium" text="예약 가능 여부를 확인하고 있습니다..." />
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
              <div className={styles.serviceGrid}>
                {SERVICE_LIST.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setBookingTime(''); // Reset time when service changes
                    }}
                    className={`${styles.serviceButton} ${selectedService.id === service.id ? styles.selected : ''}`}
                  >
                    <span className={styles.serviceName}>{service.name}</span>
                    <span className={styles.serviceDuration}>{service.duration}분</span>
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
                  {isBooking ? '잠시만 기다려주세요...' : `${selectedService.name} 예약하기`}
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
