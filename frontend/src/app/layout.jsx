import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ReduxProvider } from '@/components/ReduxProvider'

const geistSans = GeistSans

export const metadata = {
  title: 'Appointment Booking System',
  description: 'Modern appointment booking and management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={geistSans.className}>
        <ReduxProvider>
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  )
}
