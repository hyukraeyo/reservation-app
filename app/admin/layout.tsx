import { checkAdmin, checkSuperAdmin } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { AdminLogoutButton } from './AdminLogoutButton'
import styles from '@/app/home.module.scss'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkAdmin()
  const isSuperAdmin = await checkSuperAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
      <header className={styles.adminHeader}>
        <div className={styles.adminNav} style={{ flexGrow: 1 }}>
          <Link href="/admin" className={styles.adminLogo} title="대시보드 홈">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v16h12" />
            </svg>
          </Link>
          <nav className={styles.adminNav}>
            {isSuperAdmin && (
              <Link href="/admin/users" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>회원 관리</Link>
            )}
            <Link href="/admin/reservations" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>예약 관리</Link>
          </nav>
        </div>
        <div className={styles.adminActions}>
          <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>앱으로 돌아가기</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AdminLogoutButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
