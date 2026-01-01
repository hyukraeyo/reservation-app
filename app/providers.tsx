'use client'

import { ThemeProvider } from 'next-themes'
import { Suspense } from 'react'
import NavigationProgress from './components/NavigationProgress'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      {children}
    </ThemeProvider>
  )
}
