import './globals.css'

export const metadata = {
  title: 'Midnight Decibel', // Update title
  description: 'voting system for midnight decibel, a nyu cssa event. coded by carol yu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/cssa-logo.png" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
