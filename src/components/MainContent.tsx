import type { Movie } from '../types/movie'
import fallbackImage from '../assets/hero.png'

interface MainContentProps {
  genres: string[]
  selectedGenre: string
  onGenreChange: (genre: string) => void
  movies: Movie[]
  isLoading: boolean
  errorMessage: string
  onRetry: () => void
  onMovieSelect: (movie: Movie) => void
}

export function MainContent({
  genres,
  selectedGenre,
  onGenreChange,
  movies,
  isLoading,
  errorMessage,
  onRetry,
  onMovieSelect,
}: MainContentProps) {
  const getPlatformLabel = (platform: Movie['platform']) => {
    if (platform === 'tvmaze') {
      return 'TVMaze'
    }

    return 'Ghibli API'
  }

  const truncateText = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) {
      return content
    }

    return `${content.slice(0, maxLength).trim()}...`
  }

  const featuredMovie = movies[0]
  const topMovies = movies.slice().sort((a, b) => b.rating - a.rating).slice(0, 5)

  return (
    <main>
      <section id="home" className="hero">
        <div className="container">
          {featuredMovie ? (
            <article className="hero-showcase">
              <img
                src={featuredMovie.image}
                alt={featuredMovie.title}
                className="hero-backdrop"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage
                }}
              />
              <div className="hero-overlay" />
              <div className="hero-content">
                <p className="hero-kicker">No.1 hôm nay</p>
                <h1>{featuredMovie.title}</h1>
                <p className="hero-subtitle">{featuredMovie.description}</p>
                <p className="hero-meta">
                  {featuredMovie.genre} • {featuredMovie.year} • Điểm {featuredMovie.rating}
                </p>
                <div className="hero-actions">
                  <button className="primary-button hero-watch" onClick={() => onMovieSelect(featuredMovie)}>
                    Xem ngay
                  </button>
                  <button className="ghost-button" onClick={() => onGenreChange(featuredMovie.genre)}>
                    Khám phá thể loại
                  </button>
                </div>
              </div>
            </article>
          ) : (
            <div className="hero-empty">{isLoading ? 'Đang tải danh sách phim...' : 'Hiện chưa có phim để hiển thị.'}</div>
          )}
        </div>
      </section>

      <section className="genre-section">
        <div className="container genre-list">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-button ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => onGenreChange(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      <section id="movies" className="movie-section">
        <div className="container">
          <div className="section-head">
            <h2>Danh sách phim</h2>
            <span>{movies.length} kết quả</span>
          </div>

          {errorMessage ? (
            <div className="status-alert">
              <p>{errorMessage}</p>
              <button className="ghost-button" onClick={onRetry}>
                Thử tải lại
              </button>
            </div>
          ) : null}

          {movies.length === 0 ? (
            <div className="empty-state">
              {isLoading ? 'Đang đồng bộ dữ liệu phim từ API...' : 'Không có phim phù hợp với bộ lọc hiện tại.'}
            </div>
          ) : (
            <div className="movie-grid">
              {movies.map((movie) => (
                <article
                  key={movie.id}
                  className="movie-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => onMovieSelect(movie)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onMovieSelect(movie)
                    }
                  }}
                >
                  <div className="movie-media">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="movie-image"
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage
                      }}
                    />
                    <span className="movie-genre-badge">{movie.genre}</span>
                  </div>
                  <div className="movie-body">
                    <div className="movie-top">
                      <h3>{movie.title}</h3>
                      <span className="movie-rating">{movie.rating}</span>
                    </div>
                    <p className="movie-meta">
                      {movie.genre} • {movie.year} • {getPlatformLabel(movie.platform)}
                    </p>
                    <p className="movie-description">{truncateText(movie.description, 88)}</p>
                    <button
                      className="primary-button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onMovieSelect(movie)
                      }}
                    >
                      Xem chi tiết & phát phim
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="ranking" className="ranking-section">
        <div className="container">
          <h2>Bảng xếp hạng nổi bật</h2>
          <p className="ranking-subtitle">Top 5 theo điểm đánh giá cao nhất hiện tại.</p>
          <div className="top-movies">
            {topMovies.map((movie, index) => (
              <button key={movie.id} className="top-movie-item" onClick={() => onMovieSelect(movie)}>
                <span className="top-rank">#{index + 1}</span>
                <span className="top-info">
                  <strong>{movie.title}</strong>
                  <small>
                    {movie.genre} • {movie.rating}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="container contact-card">
          <h2>Liên hệ</h2>
          <p>
            Góp ý trải nghiệm để MovieHub ngày càng tốt hơn:
            <a href="mailto:support@moviehub.local"> support@moviehub.local</a>
          </p>
        </div>
      </section>
    </main>
  )
}
