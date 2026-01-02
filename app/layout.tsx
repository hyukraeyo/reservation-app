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
      <head>
        {/* Inline critical CSS for instant splash screen */}
        <style dangerouslySetInnerHTML={{
          __html: `
          #splash-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            transition: opacity 0.3s ease-out;
          }
          #splash-screen.hidden {
            opacity: 0;
            pointer-events: none;
          }
          #splash-logo {
            font-size: 4rem;
            font-weight: 900;
            color: #0f766e;
            letter-spacing: -0.05em;
            animation: splash-pulse 1.5s ease-in-out infinite;
          }
          @keyframes splash-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(0.97); }
          }
          @media (prefers-color-scheme: dark) {
            #splash-screen { background: #1e293b; }
            #splash-logo { color: #2dd4bf; }
          }
        `}} />
      </head>
      <body className={pretendard.className}>
        {/* Inline splash screen - shows immediately before React hydration */}
        <div id="splash-screen">
          <span id="splash-logo">m9</span>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
          // Hide splash screen after DOM is ready
          if (document.readyState === 'complete') {
            document.getElementById('splash-screen')?.classList.add('hidden');
            setTimeout(() => document.getElementById('splash-screen')?.remove(), 300);
          } else {
            window.addEventListener('load', function() {
              setTimeout(function() {
                document.getElementById('splash-screen')?.classList.add('hidden');
                setTimeout(() => document.getElementById('splash-screen')?.remove(), 300);
              }, 100);
            });
          }
        `}} />
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
