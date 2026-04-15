import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import fallbackImage from '../assets/hero.png'
import { fetchMovieById } from '../services/freeMoviePlatformsApi'
import type { Movie } from '../types/movie'

interface MovieDetailProps {
  movies: Movie[]
}

export function MovieDetail({ movies }: MovieDetailProps) {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const [remoteMovie, setRemoteMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isPlaying, setIsPlaying] = useState(true)
  const getPlatformLabel = (platform: Movie['platform']) => {
    if (platform === 'tvmaze') {
      return 'TVMaze'
    }

    return 'Ghibli API'
  }

  const movie = useMemo(
    () => movies.find((item) => item.id === movieId),
    [movieId, movies],
  )

  useEffect(() => {
    if (!movieId || (movie && movie.watchEmbedUrl)) {
      return
    }

    const loadMovieDetail = async () => {
      setIsLoading(true)
      setLoadError('')
      try {
        const data = await fetchMovieById(movieId)
        setRemoteMovie(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không tải được video phát.'
        setLoadError(message)
        setRemoteMovie(null)
      } finally {
        setIsLoading(false)
      }
    }

    void loadMovieDetail()
  }, [movie, movieId])

  const resolvedMovie = movie ?? remoteMovie

  useEffect(() => {
    setIsPlaying(true)
  }, [movieId])

  if (isLoading) {
    return (
      <main className="detail-main">
        <div className="container detail-wrap">
          <h1>Đang tải chi tiết phim...</h1>
        </div>
      </main>
    )
  }

  if (!resolvedMovie) {
    return (
      <main className="detail-main">
        <div className="container detail-wrap">
          <h1>Không tìm thấy phim</h1>
          <button className="primary-button detail-back" onClick={() => navigate('/')}>
            Quay về trang chủ
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="detail-main">
      <div className="container detail-wrap">
        <button className="detail-link" onClick={() => navigate('/')}>
          ← Quay lại danh sách
        </button>

        <article className="detail-card">
          <img
            src={resolvedMovie.image}
            alt={resolvedMovie.title}
            className="detail-image"
            onError={(event) => {
              event.currentTarget.src = fallbackImage
            }}
          />
          <div className="detail-content">
            <h1>{resolvedMovie.title}</h1>
            <p className="detail-meta">
              {resolvedMovie.genre} • {resolvedMovie.year} • Điểm {resolvedMovie.rating} •{' '}
              {getPlatformLabel(resolvedMovie.platform)}
            </p>
            <p className="detail-description">{resolvedMovie.description}</p>
            <div className="detail-actions">
              <button className="primary-button detail-back" onClick={() => setIsPlaying((prev) => !prev)}>
                {isPlaying ? 'Ẩn trình phát' : 'Xem trực tiếp'}
              </button>
              <button className="ghost-button detail-back" onClick={() => navigate('/')}>
                Xem phim khác
              </button>
            </div>
          </div>
        </article>

        <section className="player-panel">
          <div className="player-head">
            <h2>Trình phát phim</h2>
            <span>Phát nguồn phim public domain miễn phí</span>
          </div>
          {isPlaying && resolvedMovie.watchEmbedUrl ? (
            <div className="player-frame-wrap">
              {resolvedMovie.watchType === 'direct' ? (
                <video
                  src={resolvedMovie.watchEmbedUrl}
                  className="player-frame"
                  controls
                  autoPlay
                />
              ) : (
                <iframe
                  src={resolvedMovie.watchEmbedUrl}
                  title={`Trình phát ${resolvedMovie.title}`}
                  className="player-frame"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          ) : isPlaying ? (
            <div className="empty-state">
              {loadError || 'Phim này chưa có file stream trực tiếp. Hãy chọn phim khác.'}
            </div>
          ) : (
            <div className="player-placeholder">
              <img
                src={resolvedMovie.image}
                alt={resolvedMovie.title}
                onError={(event) => {
                  event.currentTarget.src = fallbackImage
                }}
              />
              <button className="primary-button" onClick={() => setIsPlaying(true)}>
                Phát phim ngay
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
