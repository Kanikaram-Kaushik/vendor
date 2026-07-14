import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DesignBHK Admin',
  description: 'DesignBHK Admin Dashboard — Manage users, brands, and quotes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}