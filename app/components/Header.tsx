'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './Header.module.scss';
import { ThemeToggle } from './ThemeToggle';

import { IconHome, IconCalendar, IconCalendarCheck, IconUsers, IconAdmin, IconLogOut } from './icons';

interface HeaderProps {
    userName?: string | null;
    userEmail?: string | null;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
}

export default function Header({ userName, userEmail, isAdmin, isSuperAdmin }: HeaderProps) {
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);
    const router = useRouter();
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

    const handleLogout = useCallback(async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }, [router]);

    const displayName = userName || userEmail?.split('@')[0] || '사용자';

    return (
        <header className={`${styles.header} ${!showHeader ? styles.hidden : ''}`}>
            {/* 왼쪽: 사용자 이름 */}
            <div className={styles.left}>
                <span className={styles.userName}>{displayName}님</span>
            </div>

            {/* 오른쪽: 네비게이션 링크 */}
            <nav className={styles.nav}>
                {isAdminPage ? (
                    <>
                        {/* Admin 페이지에서 보이는 링크들 */}
                        {isSuperAdmin && (
                            <Link href="/admin/users" className={styles.iconLink} title="회원 관리" aria-label="회원 관리">
                                <IconUsers />
                            </Link>
                        )}
                        <Link href="/admin/reservations" className={styles.iconLink} title="예약 관리" aria-label="예약 관리">
                            <IconCalendarCheck />
                        </Link>
                        <Link href="/" className={styles.iconLinkFilled} title="홈으로" aria-label="홈으로">
                            <IconHome />
                        </Link>
                    </>
                ) : pathname === '/my' ? (
                    <>
                        {/* 내 예약 페이지에서 보이는 링크들 */}
                        <Link href="/" className={styles.iconLink} title="홈" aria-label="홈">
                            <IconHome />
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className={styles.iconLinkFilled} title="관리자 페이지" aria-label="관리자 페이지">
                                <IconAdmin />
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        {/* 메인 페이지에서 보이는 링크들 */}
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

                {/* 테마 토글 (옵션, 헤더에 넣을지 말지) */}
                {/* <ThemeToggle /> */}

                {/* 로그아웃: 아이콘으로 변경 */}
                {/* 개발 환경에서만 보이는 조건이었으나, 아이콘화 했으므로 항상 보이거나 조건 유지 */}
                {process.env.NODE_ENV === 'development' && (
                    <button onClick={handleLogout} className={styles.iconButton} title="로그아웃" aria-label="로그아웃">
                        <IconLogOut />
                    </button>
                )}
            </nav>
        </header>
    );
}
