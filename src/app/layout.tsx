import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

import Footer from '@/components/footer'
import ClientLayout from '@/components/client-layout'
import { SearchProvider } from '@/contexts/search-context'
import { QueryProvider } from '@/providers/query-provider'
import { UploadProgressIndicator } from '@/components/ui/upload-progress-indicator'
import { APP_NAME, APP_DESCRIPTION } from '@/constants'

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.className} h-full`}
    >
      <body className="flex flex-col min-h-screen h-full">
        <QueryProvider>
          <SearchProvider>
            <ClientLayout>{children}</ClientLayout>
            <Footer />
            <Toaster />
            <UploadProgressIndicator />
          </SearchProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
