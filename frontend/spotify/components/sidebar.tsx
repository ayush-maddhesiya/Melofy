"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Search, Library, PlusCircle, LogOut } from "lucide-react"
import { usePlaylist } from "@/providers/playlist-provider"
import { useToast } from "@/components/ui/use-toast"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { playlists, createPlaylist } = usePlaylist()

  const handleLogout = () => {
    // Clear the auth cookie
    document.cookie = "auth-token=; path=/; max-age=0"

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })

    router.push("/login")
  }

  const handleCreatePlaylist = () => {
    createPlaylist()

    toast({
      title: "Playlist created",
      description: "New playlist has been created.",
    })
  }

  const routes = [
    {
      icon: Home,
      label: "Home",
      active: pathname === "/",
      href: "/",
    },
    {
      icon: Search,
      label: "Explore",
      active: pathname === "/explore",
      href: "/explore",
    },
    {
      icon: Library,
      label: "Your Library",
      active: pathname === "/library",
      href: "/library",
    },
  ]

  return (
    <div className="flex flex-col h-full w-[300px] bg-zinc-900 text-white">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold">S</span>
          </div>
          <span className="text-xl font-bold">Spotify Clone</span>
        </div>

        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition",
                route.active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white",
              )}
            >
              <route.icon className="h-5 w-5" />
              <span>{route.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-zinc-400">PLAYLISTS</span>
          <Button onClick={handleCreatePlaylist} variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-1 pr-2">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/library/${playlist.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition text-sm",
                  pathname === `/library/${playlist.id}` ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white",
                )}
              >
                <span className="truncate">{playlist.name}</span>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto px-5 py-4">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white">
          <LogOut className="h-5 w-5 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  )
}
