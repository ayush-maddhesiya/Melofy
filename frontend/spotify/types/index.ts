export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl: string
}

export interface Playlist {
  id: string
  name: string
  coverUrl: string
  songs: Song[]
}
