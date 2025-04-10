"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePlayer } from "@/providers/player-provider"
import { usePlaylist } from "@/providers/playlist-provider"
import type { Song, Playlist } from "@/types"
import { useToast } from "@/components/ui/use-toast"

interface SearchResultItemProps {
  song: Song
  playlists: Playlist[]
}

export default function SearchResultItem({ song, playlists }: SearchResultItemProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { setCurrentSong, playSong } = usePlayer()
  const { addSongToPlaylist } = usePlaylist()
  const { toast } = useToast()

  const handlePlay = () => {
    setCurrentSong(song)
    playSong()
  }

  const handleAddToPlaylist = (playlistId: string) => {
    setIsAdding(true)

    // Simulate API call with timeout
    setTimeout(() => {
      addSongToPlaylist(playlistId, song)

      const playlist = playlists.find((p) => p.id === playlistId)

      toast({
        title: "Song added",
        description: `"${song.title}" has been added to "${playlist?.name}".`,
      })

      setIsAdding(false)
    }, 500)
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="grid grid-cols-[4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md group hover:bg-zinc-800/50">
      <div className="flex items-center gap-3 truncate">
        <div className="w-10 h-10 relative flex-shrink-0">
          <Image
            src={song.coverUrl || "/placeholder.svg?height=40&width=40"}
            alt={song.title}
            width={40}
            height={40}
            className="object-cover rounded"
          />
        </div>
        <div className="truncate">
          <p className="text-sm font-medium text-white truncate">{song.title}</p>
          <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
        </div>
      </div>

      <div className="flex items-center text-sm text-zinc-400 truncate">{song.album}</div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-zinc-400">{formatDuration(song.duration)}</span>
        <Button onClick={handlePlay} variant="ghost" size="icon" className="w-8 h-8 p-0 text-zinc-400 hover:text-white">
          <Play className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 p-0 text-zinc-400 hover:text-white"
              disabled={isAdding || playlists.length === 0}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-zinc-800 border-zinc-700">
            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-400">Add to playlist</div>
            {playlists.map((playlist) => (
              <DropdownMenuItem
                key={playlist.id}
                onClick={() => handleAddToPlaylist(playlist.id)}
                className="text-white focus:bg-zinc-700 focus:text-white"
              >
                {playlist.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
