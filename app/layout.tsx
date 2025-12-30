import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "예약 앱",
  description: "노쇼 방지 예약 시스템",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

import { Providers } from './providers'
import localFont from 'next/font/local'

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
          {children}
        </Providers>
      </body>
    </html>
  )
}

