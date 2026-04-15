export interface Movie {
  id: string
  title: string
  year: number
  rating: number
  genre: string
  image: string
  description: string
  platform: 'tvmaze' | 'ghibli'
  watchType: 'direct' | 'embed' | null
  watchEmbedUrl: string | null
}
