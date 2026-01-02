import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import AuthenticatedHeader from '@/app/components/AuthenticatedHeader'
import HeaderSkeleton from '@/app/components/HeaderSkeleton'

export const metadata: Metadata = {
  title: "m9",
  description: "노쇼 방지 예약 시스템",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "m9",
  },
  formatDetection: {
    telephone: false,
  },
  // Explicit setting for iOS splash screen (workaround for Next.js 15)
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
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
          <main className="page-container">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
