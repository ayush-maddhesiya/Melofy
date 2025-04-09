"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Player from "@/components/player"
import { useToast } from "@/components/ui/use-toast"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = document.cookie.includes("auth-token")

    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to access this page.",
      })
      router.push("/login")
    }
  }, [router, toast])

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 bg-gradient-to-b from-zinc-900 to-black">{children}</main>
      </div>
      <Player />
    </div>
  )
}
