"use client"

import { useEffect } from "react"
import { usePlaylist } from "@/providers/playlist-provider"
import PlaylistCard from "@/components/playlist-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LibraryPage() {
  const { playlists, initializePlaylists } = usePlaylist()

  useEffect(() => {
    // Initialize playlists if they don't exist
    if (playlists.length === 0) {
      initializePlaylists()
    }
  }, [playlists, initializePlaylists])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Your Library</h1>

      <Tabs defaultValue="playlists" className="w-full">
        <TabsList className="bg-zinc-800 text-zinc-400">
          <TabsTrigger value="playlists" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Playlists
          </TabsTrigger>
          <TabsTrigger value="artists" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Artists
          </TabsTrigger>
          <TabsTrigger value="albums" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Albums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="mt-4">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="artists" className="mt-4 text-zinc-400">
          <div className="flex items-center justify-center h-[calc(100vh-280px)]">
            <p>Artists feature coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="albums" className="mt-4 text-zinc-400">
          <div className="flex items-center justify-center h-[calc(100vh-280px)]">
            <p>Albums feature coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
