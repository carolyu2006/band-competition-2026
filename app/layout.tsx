import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Midnight Decibel',
  description: 'CSSA Midnight Decibel',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
