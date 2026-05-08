import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AutoShowroom — Fotografia IA para Stands',
    template: '%s | AutoShowroom',
  },
  description:
    'Plataforma SaaS de fotografia com IA para stands automóvel. Transforme fotos simples em imagens de showroom profissional em minutos.',
  keywords: ['stand automóvel', 'fotografia IA', 'showroom virtual', 'viaturas', 'Portugal'],
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    siteName: 'AutoShowroom',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1117',
              border: '1px solid #1e2433',
              color: '#f1f5f9',
            },
          }}
        />
      </body>
    </html>
  )
}
