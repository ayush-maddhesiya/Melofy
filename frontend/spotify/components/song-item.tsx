"use client"

import { usePlayer } from "@/providers/player-provider"
import { usePlaylist } from "@/providers/playlist-provider"
import { Button } from "@/components/ui/button"
import { Play, Trash2 } from "lucide-react"
import type { Song } from "@/types"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface SongItemProps {
  song: Song
  index: number
  playlistId: string
}

export default function SongItem({ song, index, playlistId }: SongItemProps) {
  const { currentSong, isPlaying, setCurrentSong, playSong, pauseSong } = usePlayer()
  const { removeSongFromPlaylist } = usePlaylist()
  const { toast } = useToast()

  const isCurrentSong = currentSong?.id === song.id

  const handlePlay = () => {
    if (isCurrentSong) {
      if (isPlaying) {
        pauseSong()
      } else {
        playSong()
      }
    } else {
      setCurrentSong(song)
      playSong()
    }
  }

  const handleRemove = () => {
    removeSongFromPlaylist(playlistId, song.id)

    toast({
      title: "Song removed",
      description: `"${song.title}" has been removed from the playlist.`,
    })
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md group hover:bg-zinc-800/50",
        isCurrentSong && "bg-zinc-800/80",
      )}
    >
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 flex items-center justify-center text-sm text-zinc-400 group-hover:hidden">{index}</div>
        <Button
          onClick={handlePlay}
          variant="ghost"
          size="icon"
          className="w-4 h-4 p-0 text-white hidden group-hover:flex"
        >
          <Play className="h-3 w-3" />
        </Button>
      </div>

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
          <p className={cn("text-sm font-medium truncate", isCurrentSong ? "text-green-500" : "text-white")}>
            {song.title}
          </p>
          <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
        </div>
      </div>

      <div className="flex items-center text-sm text-zinc-400 truncate">{song.album}</div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-zinc-400">{formatDuration(song.duration)}</span>
        <Button
          onClick={handleRemove}
          variant="ghost"
          size="icon"
          className="w-8 h-8 p-0 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
