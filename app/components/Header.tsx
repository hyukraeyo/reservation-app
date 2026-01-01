'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from './Header.module.scss';

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
                            <Link href="/admin/users" className={styles.navLink}>
                                회원 관리
                            </Link>
                        )}
                        <Link href="/admin/reservations" className={styles.navLink}>
                            예약 관리
                        </Link>
                        <Link href="/" className={styles.navLinkPrimary}>
                            홈
                        </Link>
                    </>
                ) : pathname === '/my' ? (
                    <>
                        {/* 내 예약 페이지에서 보이는 링크들 */}
                        <Link href="/" className={styles.navLink}>
                            홈
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className={styles.navLinkPrimary}>
                                Admin
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        {/* 메인 페이지에서 보이는 링크들 */}
                        <Link href="/my" className={styles.navLink}>
                            내 예약
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className={styles.navLinkPrimary}>
                                Admin
                            </Link>
                        )}
                    </>
                )}

                {/* 로그아웃: 개발 환경에서만 표시 */}
                {process.env.NODE_ENV === 'development' && (
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        로그아웃
                    </button>
                )}
            </nav>
        </header>
    );
}
