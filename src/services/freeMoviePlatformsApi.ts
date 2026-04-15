import type { Movie } from '../types/movie'

interface TvMazeShow {
  id: number
  name: string
  premiered: string | null
  rating: {
    average: number | null
  }
  genres: string[]
  image: {
    original?: string
    medium?: string
  } | null
  summary: string | null
}

interface GhibliFilm {
  id: string
  title: string
  description: string
  release_date: string
  rt_score: string
  image: string
}

interface ArchiveSearchDoc {
  identifier: string
  title?: string
}

interface ArchiveSearchResponse {
  response: {
    docs: ArchiveSearchDoc[]
  }
}

interface ArchiveFile {
  name: string
  format?: string
  source?: string
}

interface ArchiveMetadataResponse {
  metadata?: {
    identifier?: string
    title?: string
    description?: string
    year?: string
    subject?: string | string[]
  }
  files?: ArchiveFile[]
}

const ARCHIVE_API_BASE_URL = 'https://archive.org'
const TVMAZE_API_BASE_URL = 'https://api.tvmaze.com'
const GHIBLI_API_BASE_URL = 'https://ghibliapi.vercel.app'

function stripHtmlTags(content: string | null): string {
  if (!content) {
    return 'Nội dung đang được cập nhật.'
  }

  return content.replace(/<[^>]*>/g, '').trim()
}

function toYear(year?: string | number): number {
  const parsed = Number(year)
  return Number.isFinite(parsed) ? parsed : 1970
}

function buildFallbackEmbed(title: string): string {
  const query = encodeURIComponent(`${title} full movie`)
  return `https://www.youtube.com/embed?listType=search&list=${query}`
}

function mapTvMazeShow(show: TvMazeShow): Movie {
  return {
    id: `tvmaze:${show.id}`,
    title: show.name,
    year: toYear(show.premiered?.slice(0, 4)),
    rating: Number((show.rating.average ?? 7.3).toFixed(1)),
    genre: show.genres[0] || 'Drama',
    image: show.image?.original || show.image?.medium || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80',
    description: stripHtmlTags(show.summary),
    platform: 'tvmaze',
    watchType: 'embed',
    watchEmbedUrl: buildFallbackEmbed(show.name),
  }
}

function mapGhibliFilm(film: GhibliFilm): Movie {
  return {
    id: `ghibli:${film.id}`,
    title: film.title,
    year: toYear(film.release_date),
    rating: Number((Number(film.rt_score) / 10 || 7.8).toFixed(1)),
    genre: 'Animation',
    image: film.image,
    description: film.description || 'Nội dung đang được cập nhật.',
    platform: 'ghibli',
    watchType: 'embed',
    watchEmbedUrl: buildFallbackEmbed(film.title),
  }
}

function resolveArchiveWatchUrl(identifier: string, files: ArchiveFile[]): string | null {
  const playableFile = files.find((file) => {
    const format = file.format?.toLowerCase() ?? ''
    const name = file.name.toLowerCase()
    const isStreamFormat =
      format.includes('h.264') ||
      format.includes('mp4') ||
      format.includes('webm') ||
      format.includes('ogg video') ||
      name.endsWith('.mp4') ||
      name.endsWith('.webm') ||
      name.endsWith('.ogv')

    return isStreamFormat && file.source !== 'original-captions'
  })

  if (!playableFile) {
    return null
  }

  return `${ARCHIVE_API_BASE_URL}/download/${identifier}/${encodeURIComponent(playableFile.name)}`
}

async function findArchiveStreamByTitle(title: string): Promise<string | null> {
  const escapedTitle = title.replaceAll('"', '\\"')
  const query = encodeURIComponent(`title:("${escapedTitle}") AND mediatype:movies`)
  const searchUrl = `${ARCHIVE_API_BASE_URL}/advancedsearch.php?q=${query}&fl[]=identifier&rows=5&page=1&output=json`
  const searchResponse = await fetch(searchUrl)
  if (!searchResponse.ok) {
    return null
  }

  const searchData = (await searchResponse.json()) as ArchiveSearchResponse
  const firstMatch = searchData.response.docs[0]
  if (!firstMatch?.identifier) {
    return null
  }

  const metadataResponse = await fetch(`${ARCHIVE_API_BASE_URL}/metadata/${firstMatch.identifier}`)
  if (!metadataResponse.ok) {
    return null
  }

  const metadataData = (await metadataResponse.json()) as ArchiveMetadataResponse
  return resolveArchiveWatchUrl(firstMatch.identifier, metadataData.files ?? [])
}

export async function fetchMoviesFromTvMaze(page = 1): Promise<Movie[]> {
  const safePage = page < 1 ? 1 : page
  const response = await fetch(`${TVMAZE_API_BASE_URL}/shows?page=${safePage - 1}`)
  if (!response.ok) {
    throw new Error('Không thể tải danh sách phim từ TVMaze.')
  }

  const data = (await response.json()) as TvMazeShow[]
  return data.slice(0, 35).map(mapTvMazeShow)
}

export async function fetchMoviesFromGhibli(): Promise<Movie[]> {
  const response = await fetch(`${GHIBLI_API_BASE_URL}/films`)
  if (!response.ok) {
    throw new Error('Không thể tải danh sách phim từ Ghibli API.')
  }

  const data = (await response.json()) as GhibliFilm[]
  return data.map(mapGhibliFilm)
}

export async function fetchFreeMoviesCatalog(): Promise<Movie[]> {
  const [tvMazeMovies, ghibliMovies] = await Promise.all([
    fetchMoviesFromTvMaze(1),
    fetchMoviesFromGhibli(),
  ])

  return [...tvMazeMovies, ...ghibliMovies]
}

export async function fetchMovieById(movieId: string): Promise<Movie> {
  const [platform, rawId] = movieId.split(':')

  if (platform === 'ghibli') {
    const response = await fetch(`${GHIBLI_API_BASE_URL}/films/${rawId}`)
    if (!response.ok) {
      throw new Error('Không thể tải chi tiết phim từ Ghibli API.')
    }

    const film = (await response.json()) as GhibliFilm
    const mappedMovie = mapGhibliFilm(film)
    const streamUrl = await findArchiveStreamByTitle(mappedMovie.title)
    return {
      ...mappedMovie,
      watchType: streamUrl ? 'direct' : 'embed',
      watchEmbedUrl: streamUrl ?? mappedMovie.watchEmbedUrl,
    }
  }

  const tvMazeId = platform === 'tvmaze' && rawId ? rawId : movieId.replace('tvmaze:', '')
  const response = await fetch(`${TVMAZE_API_BASE_URL}/shows/${tvMazeId}`)
  if (!response.ok) {
    throw new Error('Không thể tải thông tin chi tiết phim.')
  }

  const show = (await response.json()) as TvMazeShow
  const mappedMovie = mapTvMazeShow(show)
  const streamUrl = await findArchiveStreamByTitle(mappedMovie.title)

  return {
    ...mappedMovie,
    watchType: streamUrl ? 'direct' : 'embed',
    watchEmbedUrl: streamUrl ?? mappedMovie.watchEmbedUrl,
  }
}
