import type { Metadata } from 'next'
import './globals.css'
import MobilePostFAB from "@/components/ui/mobile-post-fab"

export const metadata: Metadata = {
  title: 'SocialApp',
  description: 'Just a fun Project',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}
        <MobilePostFAB />
      </body>
    </html>
  )
}
