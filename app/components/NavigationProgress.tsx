'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress - 페이지 전환 시 상단 진행 바 표시
 */
export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // 페이지 변경 감지 시 진행 바 완료 처리
        // 렌더링 중 상태 업데이트 방지를 위해 setTimeout 사용
        const t = setTimeout(() => {
            setIsNavigating(false);
            setProgress(100);

            const resetTimer = setTimeout(() => {
                setProgress(0);
            }, 200);
            return () => clearTimeout(resetTimer);
        }, 0);

        return () => clearTimeout(t);
    }, [pathname, searchParams]);

    useEffect(() => {
        let progressTimer: NodeJS.Timeout;

        const handleStart = () => {
            setIsNavigating(true);
            setProgress(10);

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

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link && link.href && !link.target && !link.download) {
                const url = new URL(link.href, window.location.origin);
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
