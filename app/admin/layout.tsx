import { checkAdmin } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
      <header style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>
            <h1 style={{ margin: 0, fontSize: '1.2rem' }}>관리자 대시보드</h1>
          </Link>
          <nav style={{ display: 'flex', gap: '1rem' }}>
             <Link href="/admin/users" style={{ fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: 'none' }}>회원 관리</Link>
             <Link href="/admin/reservations" style={{ fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: 'none' }}>예약 관리</Link>
          </nav>
        </div>
        <Link href="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>앱으로 돌아가기</Link>
      </header>
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  )
}
