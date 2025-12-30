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
        <div className={styles.adminNav}>
          <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, whiteSpace: 'nowrap' }}>관리자 대시보드</h1>
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
