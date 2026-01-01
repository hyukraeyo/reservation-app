import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import Header from '@/app/components/Header'
import loadingStyles from './loading.module.scss'

export const metadata: Metadata = {
  title: "예약 앱",
  description: "노쇼 방지 예약 시스템",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "혁래요",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const pretendard = localFont({
  src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

// 헤더 데이터 로딩 컴포넌트
async function AuthenticatedHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 로그인하지 않은 경우 헤더 표시 안 함
  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'
  const isSuperAdmin = profile?.role === 'admin'

  return (
    <Header
      userName={profile?.full_name}
      userEmail={user.email}
      isAdmin={isAdmin}
      isSuperAdmin={isSuperAdmin}
    />
  )
}

// 헤더 스켈레톤
function HeaderSkeleton() {
  return (
    <div style={{
      position: 'fixed',
      top: '1.25rem',
      left: '1.25rem',
      right: '1.25rem',
      padding: '0.75rem 1.5rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '100px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '600px',
      margin: '0 auto',
      zIndex: 1000,
    }}>
      <div className={loadingStyles.skeleton} style={{ width: '80px', height: '18px', borderRadius: '4px' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className={loadingStyles.skeleton} style={{ width: '50px', height: '22px', borderRadius: '100px' }} />
        <div className={loadingStyles.skeleton} style={{ width: '50px', height: '22px', borderRadius: '100px' }} />
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={pretendard.variable}>
      <body className={pretendard.className}>
        <Providers>
          <Suspense fallback={<HeaderSkeleton />}>
            <AuthenticatedHeader />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  )
}
