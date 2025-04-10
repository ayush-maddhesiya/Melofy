import type { Playlist } from "@/types"
import { v4 as uuidv4 } from "uuid"
import { allSongs } from "./songs"

// Create sample playlists with some songs
export const samplePlaylists: Playlist[] = [
  {
    id: uuidv4(),
    name: "My Favorite Songs",
    coverUrl: "/placeholder.svg?height=300&width=300&text=Favorites",
    songs: [allSongs[0], allSongs[2], allSongs[5]],
  },
  {
    id: uuidv4(),
    name: "Rock Classics",
    coverUrl: "/placeholder.svg?height=300&width=300&text=Rock",
    songs: [allSongs[3], allSongs[4], allSongs[6], allSongs[8]],
  },
  {
    id: uuidv4(),
    name: "Chill Vibes",
    coverUrl: "/placeholder.svg?height=300&width=300&text=Chill",
    songs: [allSongs[5], allSongs[9], allSongs[10]],
  },
]
