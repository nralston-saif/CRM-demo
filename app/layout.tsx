import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
  title: 'SAIF CRM Demo',
  description: 'Demo version of the SAIF Ventures CRM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#fafafa]">
        <ToastProvider>
          <Navigation />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  )
}
