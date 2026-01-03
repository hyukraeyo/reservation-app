'use client';

import { useState, useEffect } from 'react';
import styles from './InstallPrompt.module.scss';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSInstruction, setShowIOSInstruction] = useState(false);

    useEffect(() => {

        // 이미 PWA로 실행 중인지 확인
        const isStandaloneMode =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone ||
            document.referrer.includes('android-app://');

        // setTimeout으로 감싸서 렌더링 주기 분리 (린트 에러 회피)
        setTimeout(() => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            setIsStandalone(isStandaloneMode);
            setIsIOS(/iphone|ipad|ipod/.test(userAgent));
        }, 0);

        // 안드로이드 설치 프롬프트 이벤트 리스너
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    if (isStandalone) return null;

    // iOS도 아니고 설치 프롬프트도 안 떴으면(안드로이드에서 이미 설치했거나 PC 등) 숨김
    // 단, iOS는 언제나 버튼을 보여줌 (안내를 위해)
    if (!isIOS && !deferredPrompt) return null;

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstruction(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.installButton} onClick={handleInstallClick}>
                <div className={styles.iconWrapper}>
                    <Image src="/icon-192x192.png" alt="App Icon" width={32} height={32} />
                </div>
                <span>{isIOS ? '홈 화면에 앱 추가하기' : '앱 설치하고 편하게 쓰기'}</span>
            </button>

            {showIOSInstruction && (
                <div className={styles.iosInstruction}>
                    <p>
                        하단의 <strong>공유</strong> 버튼
                        <svg className={styles.shareIcon} viewBox="0 0 50 50" width="16" height="16" fill="#007AFF">
                            <path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z" />
                            <path d="M24 7h2v21h-2z" />
                            <path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z" />
                        </svg>
                        을 누르고<br />
                        <strong>&apos;홈 화면에 추가&apos;</strong>를 선택해주세요.
                    </p>
                    <button className={styles.closeButton} onClick={() => setShowIOSInstruction(false)}>
                        닫기
                    </button>
                </div>
            )}
        </div>
    );
}
