'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress - 페이지 전환 시 상단 진행 바 표시
 * iPhone Safari에서 페이지 전환이 느리게 느껴지는 문제를 해결하기 위해
 * 즉각적인 시각적 피드백을 제공합니다.
 */
export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // 페이지가 변경되면 진행 바를 완료 상태로
        setIsNavigating(false);
        setProgress(100);

        const timer = setTimeout(() => setProgress(0), 200);
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    useEffect(() => {
        let progressTimer: NodeJS.Timeout;

        const handleStart = () => {
            setIsNavigating(true);
            setProgress(10);

            // 진행 상태 시뮬레이션 (0-90% 까지만)
            progressTimer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressTimer);
                        return prev;
                    }
                    return prev + Math.random() * 10;
                });
            }, 100);
        };

        const handleComplete = () => {
            clearInterval(progressTimer);
            setIsNavigating(false);
            setProgress(100);
            setTimeout(() => setProgress(0), 200);
        };

        // Link 클릭 이벤트 감지
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href && !link.target && !link.download) {
                const url = new URL(link.href, window.location.origin);

                // 같은 origin이고 다른 pathname인 경우에만 진행 바 표시
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    handleStart();
                }
            }
        };

        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
            clearInterval(progressTimer);
        };
    }, [pathname]);

    if (progress === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                zIndex: 9999,
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--primary-color, #007AFF) 0%, #00C6FF 100%)',
                    boxShadow: '0 0 10px var(--primary-color, #007AFF), 0 0 5px var(--primary-color, #007AFF)',
                    transition: isNavigating
                        ? 'width 0.3s ease-out'
                        : 'width 0.2s ease-out, opacity 0.2s ease-out',
                    opacity: progress === 100 ? 0 : 1,
                    borderRadius: '0 2px 2px 0',
                }}
            />
        </div>
    );
}
