"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { usePlaylist } from "@/providers/playlist-provider"
import SearchResultItem from "@/components/search-result-item"
import type { Song } from "@/types"
import { allSongs } from "@/data/songs"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { playlists } = usePlaylist()

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Simulate API call with timeout
    setTimeout(() => {
      const results = allSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.album.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(results)
      setIsSearching(false)
    }, 500)
  }

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch()
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Explore</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search for songs, artists, or albums"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-green-500 hover:bg-green-600 text-black font-bold"
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {searchResults.length > 0
            ? `Search Results (${searchResults.length})`
            : searchQuery.trim()
              ? "No results found"
              : "Start searching for music"}
        </h2>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1">
            {searchResults.map((song) => (
              <SearchResultItem key={song.id} song={song} playlists={playlists} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
