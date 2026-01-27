import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OTA Pricing Structure System',
  description: 'Manage OTA campaigns and optimize revenue',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-950 text-white">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col gap-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              OTA Pricing
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                🏠 Overview
              </Link>
              <Link href="/pricing" className="px-4 py-2 bg-blue-600 rounded-lg transition-colors">
                💰 Pricing Calculator
              </Link>
              <Link href="/parity" className="px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                ⚖️ Rate Parity
              </Link>
              <Link href="/compset" className="px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                📊 Compset Analysis
              </Link>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-800">
              <div className="text-xs text-gray-500 uppercase tracking-widest">Hotel Profile</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40" />
                <div className="text-sm font-medium">Ocean View Resort</div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
