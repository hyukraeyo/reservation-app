'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.scss';
import { APP_NAME } from '@/app/constants';
import { IconCalendar, IconCalendarCheck, IconUsers, IconAdmin, IconBell } from './icons';
import { createClient } from '@/utils/supabase/client';
import { useConfirmModal } from '@/app/components/ConfirmModal';

interface HeaderProps {
    userName?: string | null;
    userEmail?: string | null;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
}

const CLICK_THRESHOLD = 5; // 클릭 횟수
const CLICK_TIMEOUT = 1000; // 1초 내에 클릭해야 함

export default function Header({ isAdmin, isSuperAdmin }: HeaderProps) {
    const [showHeader, setShowHeader] = useState(true);
    const [showLogout, setShowLogout] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const lastScrollY = useRef(0);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { confirm, ModalComponent } = useConfirmModal();

    const isAdminPage = pathname?.startsWith('/admin');

    // 로고 클릭 핸들러
    const handleLogoClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();

        // 타임아웃 리셋
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }

        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= CLICK_THRESHOLD) {
            setShowLogout(prev => !prev);
            setClickCount(0);
        } else {
            // 1초 후 카운트 리셋
            clickTimeoutRef.current = setTimeout(() => {
                setClickCount(0);
            }, CLICK_TIMEOUT);
        }
    }, [clickCount]);

    // 로그아웃 핸들러
    const handleLogout = async () => {
        const isConfirmed = await confirm({
            title: '로그아웃',
            message: '정말 로그아웃 하시겠습니까?',
            variant: 'danger'
        });

        if (isConfirmed) {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
        }
    };

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
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, []);

    return (
        <header className={`${styles.header} ${!showHeader ? styles.hidden : ''}`}>
            {ModalComponent}
            {/* 왼쪽: 로고 (5회 클릭 시 로그아웃 토글) */}
            <div className={styles.left}>
                <button
                    onClick={handleLogoClick}
                    className={styles.logoButton}
                    title="홈으로"
                >
                    <span className={styles.logoText}>{APP_NAME}</span>
                </button>

                {/* 숨겨진 로그아웃 버튼 */}
                {showLogout && (
                    <button
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        로그아웃
                    </button>
                )}
            </div>

            {/* 오른쪽: 네비게이션 */}
            <nav className={styles.nav}>
                <Link href="/notifications" className={styles.iconLink} title="알림함" aria-label="알림함">
                    <IconBell />
                </Link>

                {isAdminPage ? (
                    <>
                        {isSuperAdmin && (
                            <Link href="/admin/users" className={styles.iconLink} title="회원 관리" aria-label="회원 관리">
                                <IconUsers />
                            </Link>
                        )}
                        <Link href="/admin/reservations" className={styles.iconLink} title="예약 관리" aria-label="예약 관리">
                            <IconCalendarCheck />
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/my" className={styles.iconLink} title="내 예약" aria-label="내 예약">
                            <IconCalendar />
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className={styles.iconLinkFilled} title="관리자 페이지" aria-label="관리자 페이지">
                                <IconAdmin />
                            </Link>
                        )}
                    </>
                )}
            </nav>
        </header>
    );
}
