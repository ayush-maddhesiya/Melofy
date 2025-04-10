"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlayer } from "@/providers/player-provider"
import type { Playlist } from "@/types"

interface PlaylistCardProps {
  playlist: Playlist
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  const { setCurrentSong, playSong } = usePlayer()

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (playlist.songs.length > 0) {
      setCurrentSong(playlist.songs[0])
      playSong()
    }
  }

  return (
    <Link href={`/library/${playlist.id}`}>
      <div className="group relative bg-zinc-800/50 rounded-md p-4 transition-all hover:bg-zinc-800 space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-md shadow-lg">
          <Image
            src={playlist.coverUrl || "/placeholder.svg?height=200&width=200"}
            alt={playlist.name}
            width={200}
            height={200}
            className="object-cover transition-all group-hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handlePlay}
              size="icon"
              className="rounded-full bg-green-500 hover:bg-green-600 text-black shadow-lg"
              disabled={playlist.songs.length === 0}
            >
              <Play className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
          <p className="text-sm text-zinc-400 mt-1">
            {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
          </p>
        </div>
      </div>
    </Link>
  )
}
