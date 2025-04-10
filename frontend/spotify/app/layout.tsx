import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import "@/app/globals.css"
import { Mona_Sans as FontSans } from "next/font/google"
import { PlayerProvider } from "@/providers/player-provider"
import { PlaylistProvider } from "@/providers/playlist-provider"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Spotify Clone",
  description: "A Spotify clone built with Next.js and Tailwind CSS",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <PlaylistProvider>
            <PlayerProvider>
              {children}
              <Toaster />
            </PlayerProvider>
          </PlaylistProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'