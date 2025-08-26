import { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './AuthContext'
import { LanguageProvider } from './LanguageContext'

export const metadata: Metadata = {
  title: 'Panel de CTF de Seguridad del Campus',
  description: 'Panel de seguimiento del evento de CTF de ciberseguridad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
