import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from './providers'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import AuthenticatedHeader from '@/app/components/AuthenticatedHeader'
import HeaderSkeleton from '@/app/components/HeaderSkeleton'
import SplashScreen from '@/app/components/SplashScreen'

export const metadata: Metadata = {
  title: "m9",
  description: "노쇼 방지 예약 시스템",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "m9",
    // iOS Splash Screens - covers most modern iPhones
    startupImage: [
      // iPhone 14 Pro Max, 15 Pro Max, 16 Pro Max (1290x2796)
      {
        url: "/splashscreens/apple-splash-1170-2532.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 Pro, 15 Pro, 16 Pro (1179x2556)
      {
        url: "/splashscreens/apple-splash-1170-2532.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14, 15, 16, 14 Plus, 15 Plus, 16 Plus (1170x2532 / 1284x2778)
      {
        url: "/splashscreens/apple-splash-1170-2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 13 mini, 12 mini (1080x2340)
      {
        url: "/splashscreens/apple-splash-1170-2532.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone SE 3rd gen, 8, 7, 6s (750x1334)
      {
        url: "/splashscreens/apple-splash-1170-2532.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
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
    <html
      lang="ko"
      suppressHydrationWarning
      className={pretendard.variable}
      style={{ backgroundColor: '#0f766e' }}
    >
      <body
        className={pretendard.className}
        style={{ backgroundColor: '#0f766e' }}
      >
        <Providers>
          <SplashScreen />
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
