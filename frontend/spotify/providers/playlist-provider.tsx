"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Playlist, Song } from "@/types"
import { samplePlaylists } from "@/data/playlists"

interface PlaylistContextType {
  playlists: Playlist[]
  getPlaylistById: (id: string) => Playlist | undefined
  createPlaylist: () => void
  addSongToPlaylist: (playlistId: string, song: Song) => void
  removeSongFromPlaylist: (playlistId: string, songId: string) => void
  initializePlaylists: () => void
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const initializePlaylists = useCallback(() => {
    setPlaylists(samplePlaylists)
  }, [])

  const getPlaylistById = useCallback(
    (id: string) => {
      return playlists.find((playlist) => playlist.id === id)
    },
    [playlists],
  )

  const createPlaylist = useCallback(() => {
    const newPlaylistCount = playlists.length + 1
    const newPlaylist: Playlist = {
      id: uuidv4(),
      name: `My Playlist #${newPlaylistCount}`,
      coverUrl: "",
      songs: [],
    }

    setPlaylists((prev) => [...prev, newPlaylist])
  }, [playlists])

  const addSongToPlaylist = useCallback((playlistId: string, song: Song) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          // Check if song already exists in playlist
          const songExists = playlist.songs.some((s) => s.id === song.id)

          if (songExists) {
            return playlist
          }

          return {
            ...playlist,
            songs: [...playlist.songs, song],
          }
        }
        return playlist
      }),
    )
  }, [])

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            songs: playlist.songs.filter((song) => song.id !== songId),
          }
        }
        return playlist
      }),
    )
  }, [])

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        getPlaylistById,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        initializePlaylists,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export const usePlaylist = () => {
  const context = useContext(PlaylistContext)

  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider")
  }

  return context
}
