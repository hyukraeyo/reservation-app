
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
import { ThemeToggle } from './components/ThemeToggle'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>
          <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }}>
            <ThemeToggle />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}
