"use client"

import { useState, useEffect, useRef } from "react"
import { usePlayer } from "@/providers/player-provider"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Repeat, Shuffle } from "lucide-react"
import Image from "next/image"

export default function Player() {
  const { currentSong, isPlaying, playSong, pauseSong, nextSong, previousSong } = usePlayer()

  const [volume, setVolume] = useState(80)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSong])

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // Update progress
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [])

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0]
    setProgress(newProgress)

    if (audioRef.current && duration) {
      const newTime = (newProgress / 100) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

  if (!currentSong) {
    return (
      <div className="h-20 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-center text-zinc-400">
        No song selected
      </div>
    )
  }

  return (
    <div className="h-20 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center">
      <audio ref={audioRef} src={currentSong.audioUrl} onEnded={nextSong} />

      <div className="w-1/4 flex items-center gap-3">
        <div className="w-14 h-14 relative">
          <Image
            src={currentSong.coverUrl || "/placeholder.svg?height=56&width=56"}
            alt={currentSong.title}
            width={56}
            height={56}
            className="object-cover rounded"
          />
        </div>
        <div className="truncate">
          <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
          <p className="text-zinc-400 text-xs truncate">{currentSong.artist}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button onClick={previousSong} variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            onClick={isPlaying ? pauseSong : playSong}
            variant="ghost"
            size="icon"
            className="bg-white text-black hover:bg-zinc-200 rounded-full h-8 w-8"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button onClick={nextSong} variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <SkipForward className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
          <Slider value={[progress]} max={100} step={0.1} onValueChange={handleProgressChange} className="w-full" />
          <span className="text-xs text-zinc-400 w-10">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="w-1/4 flex items-center justify-end gap-2">
        <VolumeIcon className="h-5 w-5 text-zinc-400" />
        <Slider value={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0])} className="w-24" />
      </div>
    </div>
  )
}
