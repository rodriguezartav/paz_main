import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const polymath = localFont({
  src: './fonts/Polymath-Regular.woff2',
  variable: '--font-polymath',
})

const polymathDisplay = localFont({
  src: './fonts/PolymathDisp-Regular.woff2',
  variable: '--font-polymath-display',
})

export const metadata: Metadata = {
  title: 'Paz Operations',
  description: 'Operations app for Paz Corcovado - an off-grid rainforest/ocean shared living space',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${polymath.variable} ${polymathDisplay.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
