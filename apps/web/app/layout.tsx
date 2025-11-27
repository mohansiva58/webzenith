'use client'
import './globals.css'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { Navbar } from '@/components/Navbar'

const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
