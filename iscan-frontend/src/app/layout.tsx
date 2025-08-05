import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'iScan Document Processing',
  description: 'Document scanning and processing system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center space-x-8">
                    <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                      iScan Document Processing
                    </Link>
                    <div className="flex space-x-4">
                      <Link 
                        href="/" 
                        className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/file-types" 
                        className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        File Types
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}