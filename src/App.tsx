import { useMemo, useState } from 'react'
import { Footer } from './components/Footer.tsx'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent.tsx'
import { movies } from './data/movies'
import type { Movie } from './types/movie'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Tất cả')
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null)

  const handleNavigate = (targetId: string) => {
    const target = document.getElementById(targetId)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const genres = useMemo(() => {
    const uniqueGenres = new Set(movies.map((movie) => movie.genre))
    return ['Tất cả', ...Array.from(uniqueGenres)]
  }, [])

  const filteredMovies = useMemo(
    () =>
      movies.filter((movie) => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesGenre = selectedGenre === 'Tất cả' || movie.genre === selectedGenre
        return matchesSearch && matchesGenre
      }),
    [searchTerm, selectedGenre],
  )

  return (
    <div className="app">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        navItems={[
          { label: 'Trang chủ', targetId: 'home' },
          { label: 'Phim', targetId: 'movies' },
          { label: 'Bảng xếp hạng', targetId: 'ranking' },
          { label: 'Liên hệ', targetId: 'contact' },
        ]}
        onNavigate={handleNavigate}
      />
      <MainContent
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        movies={filteredMovies}
        onMovieSelect={setActiveMovie}
      />
      <Footer onNavigate={handleNavigate} />

      {activeMovie && (
        <div className="movie-modal-overlay" onClick={() => setActiveMovie(null)}>
          <div className="movie-modal" onClick={(event) => event.stopPropagation()}>
            <h3>{activeMovie.title}</h3>
            <p>
              {activeMovie.genre} • {activeMovie.year} • {activeMovie.rating}
            </p>
            <p>{activeMovie.description}</p>
            <button className="primary-button" onClick={() => setActiveMovie(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
