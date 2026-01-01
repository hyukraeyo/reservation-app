'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';
import { APP_NAME } from '@/app/constants';
import { IconCalendar, IconCalendarCheck, IconUsers, IconAdmin, IconBell } from './icons';

interface HeaderProps {
    userName?: string | null;
    userEmail?: string | null;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
}

// userName, userEmail은 이제 사용하지 않지만 상위 컴포넌트(RootLayout) 호환성을 위해 Props 인터페이스는 유지
export default function Header({ isAdmin, isSuperAdmin }: HeaderProps) {
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);
    const pathname = usePathname();

    // 현재 페이지가 Admin인지 확인
    const isAdminPage = pathname?.startsWith('/admin');

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

    return (
        <header className={`${styles.header} ${!showHeader ? styles.hidden : ''}`}>
            {/* 왼쪽: 로고 (홈으로 이동) */}
            <div className={styles.left}>
                <Link href="/" className={styles.logoLink} title="홈으로">
                    <span className={styles.logoText}>{APP_NAME}</span>
                </Link>
            </div>

            {/* 오른쪽: 네비게이션 */}
            <nav className={styles.nav}>
                {/* 1. 알림함 (공통) */}
                <Link href="/notifications" className={styles.iconLink} title="알림함" aria-label="알림함">
                    <IconBell />
                </Link>

                {isAdminPage ? (
                    <>
                        {/* Admin 페이지 */}
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
                        {/* 일반 페이지 */}
                        {pathname !== '/my' && (
                            <Link href="/my" className={styles.iconLink} title="내 예약" aria-label="내 예약">
                                <IconCalendar />
                            </Link>
                        )}
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
