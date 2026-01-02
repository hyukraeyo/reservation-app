'use client';

import { useSyncExternalStore, useState, useEffect, useCallback } from 'react';
import styles from './SplashScreen.module.scss';

interface SplashScreenProps {
    minimumDisplayTime?: number; // 최소 표시 시간 (ms)
}

// PWA 모드인지 확인하는 외부 스토어
function subscribeToPWAMode(_callback: () => void) {
    // PWA 모드는 변경되지 않으므로 구독 불필요
    return () => { };
}

function getPWAModeSnapshot(): boolean {
    const isPWA =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash') === 'true';
    return isPWA && !hasSeenSplash;
}

function getPWAModeServerSnapshot(): boolean {
    return false; // SSR에서는 스플래시 표시 안 함
}

export default function SplashScreen({ minimumDisplayTime = 1500 }: SplashScreenProps) {
    // useSyncExternalStore를 사용하여 초기 상태 결정
    const shouldShow = useSyncExternalStore(
        subscribeToPWAMode,
        getPWAModeSnapshot,
        getPWAModeServerSnapshot
    );

    const [isHiding, setIsHiding] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);

    // 타이머 콜백
    const handleHide = useCallback(() => {
        setIsHiding(true);
        sessionStorage.setItem('hasSeenSplash', 'true');
    }, []);

    const handleRemove = useCallback(() => {
        setIsRemoved(true);
    }, []);

    // 타이머 설정
    useEffect(() => {
        if (!shouldShow) return;

        const hideTimer = setTimeout(handleHide, minimumDisplayTime);
        const removeTimer = setTimeout(handleRemove, minimumDisplayTime + 500);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(removeTimer);
        };
    }, [shouldShow, minimumDisplayTime, handleHide, handleRemove]);

    // 표시 안 함이거나 이미 제거됨
    if (!shouldShow || isRemoved) {
        return null;
    }

    return (
        <div
            className={`${styles.splashScreen} ${isHiding ? styles.hidden : ''}`}
            aria-label="앱 로딩 중"
            role="status"
        >
            <div className={styles.logoContainer}>
                <h1 className={styles.logo}>m9</h1>
                <p className={styles.tagline}>노쇼 방지 예약 시스템</p>
            </div>
            <div className={styles.dots} aria-hidden="true">
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
            </div>
        </div>
    );
}
