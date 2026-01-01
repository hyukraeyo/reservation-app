'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './Header.module.scss';
import { ThemeToggle } from './ThemeToggle';

// Icons
const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconCalendarCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M9 16l2 2 4-4"></path></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconAdmin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconLogOut = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

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
