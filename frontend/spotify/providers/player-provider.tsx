"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import type { Song } from "@/types"

interface PlayerContextType {
  currentSong: Song | null
  isPlaying: boolean
  setCurrentSong: (song: Song) => void
  playSong: () => void
  pauseSong: () => void
  nextSong: () => void
  previousSong: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playSong = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const pauseSong = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const nextSong = useCallback(() => {
    // In a real app, this would find the next song in the current playlist
    // For this demo, we'll just simulate it by pausing
    setIsPlaying(false)
  }, [])

  const previousSong = useCallback(() => {
    // In a real app, this would find the previous song in the current playlist
    // For this demo, we'll just simulate it by pausing
    setIsPlaying(false)
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        setCurrentSong,
        playSong,
        pauseSong,
        nextSong,
        previousSong,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)

  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }

  return context
}
