import { checkAdmin } from './actions'
import { redirect } from 'next/navigation'

// 권한 체크 래퍼 컴포넌트
async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkAdmin()

  if (!isAdmin) {
    redirect('/')
  }

  return <>{children}</>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthGuard>
      <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <main style={{ padding: '6rem 1rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  )
}
