"use client"
import { useParams } from "next/navigation"
import { usePlaylist } from "@/providers/playlist-provider"
import { usePlayer } from "@/providers/player-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Clock3 } from "lucide-react"
import SongItem from "@/components/song-item"
import Image from "next/image"

export default function PlaylistPage() {
  const params = useParams()
  const playlistId = params.id as string

  const { getPlaylistById } = usePlaylist()
  const { setCurrentSong, playSong } = usePlayer()

  const playlist = getPlaylistById(playlistId)

  const handlePlayPlaylist = () => {
    if (playlist && playlist.songs.length > 0) {
      setCurrentSong(playlist.songs[0])
      playSong()
    }
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-zinc-400">Playlist not found</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
        <div className="w-48 h-48 relative shadow-lg">
          <Image
            src={playlist.coverUrl || "/placeholder.svg?height=192&width=192"}
            alt={playlist.name}
            width={192}
            height={192}
            className="object-cover rounded-md"
          />
        </div>
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm text-zinc-400">Playlist</p>
          <h1 className="text-4xl font-bold text-white mt-2">{playlist.name}</h1>
          <p className="text-zinc-400 mt-2">{playlist.songs.length} songs</p>
          <Button
            onClick={handlePlayPlaylist}
            className="mt-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full px-8"
            disabled={playlist.songs.length === 0}
          >
            <Play className="mr-2 h-5 w-5" />
            Play
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-2 border-b border-zinc-800 text-zinc-400 text-sm">
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div className="flex justify-end">
            <Clock3 className="h-4 w-4" />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-400px)]">
          {playlist.songs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-zinc-400">
              No songs in this playlist. Add songs from the Explore page.
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              {playlist.songs.map((song, index) => (
                <SongItem key={song.id} song={song} index={index + 1} playlistId={playlist.id} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
