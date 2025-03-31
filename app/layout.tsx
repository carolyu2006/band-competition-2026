import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Midnight Decibel',
  description: ' CSSA Midnight Decibel',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
