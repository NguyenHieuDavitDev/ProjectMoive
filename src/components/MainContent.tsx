import type { Movie } from '../types/movie'
import fallbackImage from '../assets/hero.png'

interface MainContentProps {
  genres: string[]
  selectedGenre: string
  onGenreChange: (genre: string) => void
  movies: Movie[]
  onMovieSelect: (movie: Movie) => void
}

export function MainContent({
  genres,
  selectedGenre,
  onGenreChange,
  movies,
  onMovieSelect,
}: MainContentProps) {
  return (
    <main>
      <section id="home" className="hero">
        <div className="container hero-inner">
          <p className="hero-kicker">Bộ sưu tập chọn lọc</p>
          <h1>Trang phim đơn giản, đẹp mắt và hiện đại</h1>
          <p className="hero-subtitle">
            Tìm kiếm nhanh bộ phim bạn muốn xem và khám phá các thể loại nổi bật.
          </p>
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

          {movies.length === 0 ? (
            <div className="empty-state">Không có phim phù hợp với bộ lọc hiện tại.</div>
          ) : (
            <div className="movie-grid">
              {movies.map((movie) => (
                <article key={movie.id} className="movie-card">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="movie-image"
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage
                    }}
                  />
                  <div className="movie-body">
                    <div className="movie-top">
                      <h3>{movie.title}</h3>
                      <span className="movie-rating">{movie.rating}</span>
                    </div>
                    <p className="movie-meta">
                      {movie.genre} • {movie.year}
                    </p>
                    <p className="movie-description">{movie.description}</p>
                    <button className="primary-button" onClick={() => onMovieSelect(movie)}>
                      Xem chi tiết
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
          <p className="ranking-subtitle">Top 3 theo điểm đánh giá cao nhất hiện tại.</p>
          <div className="top-movies">
            {movies
              .slice()
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((movie) => (
                <button key={movie.id} className="top-movie-item" onClick={() => onMovieSelect(movie)}>
                  {movie.title} • {movie.rating}
                </button>
              ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Liên hệ</h2>
          <p>Email: support@moviehub.local</p>
        </div>
      </section>
    </main>
  )
}
