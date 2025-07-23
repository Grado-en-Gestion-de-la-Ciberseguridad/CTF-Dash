import { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './AuthContext'

export const metadata: Metadata = {
  title: 'Campus Security CTF Dashboard',
  description: 'Cybersecurity Capture the Flag event tracking dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
