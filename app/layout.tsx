import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'R-Cycle - Internal Marketplace',
  description: 'Internal hardware marketplace for decommissioned equipment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
