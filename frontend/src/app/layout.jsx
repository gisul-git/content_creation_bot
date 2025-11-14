import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
import ClientErrorBoundary from '@/components/ClientErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: {
    default: 'AI Content Creation Chatbot',
    template: '%s | AI Content Creation',
  },
  description: 'Create videos, images, text, or SCORM courses through conversation with AI-powered content creation assistant',
  keywords: ['AI', 'content creation', 'chatbot', 'video creation', 'image generation', 'SCORM', 'e-learning'],
  authors: [{ name: 'Content Creation Bot' }],
  creator: 'Content Creation Bot',
  publisher: 'Content Creation Bot',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AI Content Creation Chatbot',
    description: 'Create videos, images, text, or SCORM courses through conversation',
    siteName: 'AI Content Creation Chatbot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Creation Chatbot',
    description: 'Create videos, images, text, or SCORM courses through conversation',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#764ba2' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <ClientErrorBoundary>
          <AuthProvider>
            <ChatProvider>{children}</ChatProvider>
          </AuthProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  )
}
