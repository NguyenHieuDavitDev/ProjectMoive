import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import fallbackImage from '../assets/hero.png'
import { movies } from '../data/movies'

export function MovieDetail() {
  const { movieId } = useParams()
  const navigate = useNavigate()

  const movie = useMemo(
    () => movies.find((item) => item.id === Number(movieId)),
    [movieId],
  )

  if (!movie) {
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
            src={movie.image}
            alt={movie.title}
            className="detail-image"
            onError={(event) => {
              event.currentTarget.src = fallbackImage
            }}
          />
          <div className="detail-content">
            <h1>{movie.title}</h1>
            <p className="detail-meta">
              {movie.genre} • {movie.year} • Điểm {movie.rating}
            </p>
            <p className="detail-description">{movie.description}</p>
            <button className="primary-button detail-back" onClick={() => navigate('/')}>
              Xem phim khác
            </button>
          </div>
        </article>
      </div>
    </main>
  )
}
