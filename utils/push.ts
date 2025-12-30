import webPush, { type PushSubscription } from 'web-push';

// VAPID 키가 설정되어 있을 때만 web-push 초기화
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    'mailto:admin@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface PushResult {
  success: boolean;
  error?: Error;
}

/**
 * 푸시 알림을 전송합니다.
 * @param subscription - 구독 정보
 * @param title - 알림 제목
 * @param body - 알림 본문
 * @param url - 클릭 시 이동할 URL (기본값: '/')
 */
export async function sendPushNotification(
  subscription: PushSubscription, 
  title: string, 
  body: string, 
  url = '/'
): Promise<PushResult | undefined> {
  if (!subscription) return undefined;

  const payload = JSON.stringify({ title, body, url });

  try {
    await webPush.sendNotification(subscription, payload);
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('푸시 알림 전송 실패:', error.message);
    return { success: false, error };
  }
}
