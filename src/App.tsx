import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Footer } from './components/Footer.tsx'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent.tsx'
import { MovieDetail } from './components/MovieDetail.tsx'
import { fetchFreeMoviesCatalog } from './services/freeMoviePlatformsApi'
import type { Movie } from './types/movie'
import './App.scss'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Tất cả')
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const pendingSectionRef = useRef<string | null>(null)

  const loadMovies = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const moviesCatalog = await fetchFreeMoviesCatalog()
      setAllMovies(moviesCatalog)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu phim.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMovies()
  }, [loadMovies])

  const handleNavigate = (targetId: string) => {
    if (location.pathname !== '/') {
      pendingSectionRef.current = targetId
      navigate('/')
      return
    }

    const target = document.getElementById(targetId)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (location.pathname === '/' && pendingSectionRef.current) {
      const target = document.getElementById(pendingSectionRef.current)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      pendingSectionRef.current = null
    }
  }, [location.pathname])

  const genres = useMemo(() => {
    const uniqueGenres = new Set(allMovies.map((movie) => movie.genre))
    return ['Tất cả', ...Array.from(uniqueGenres)]
  }, [allMovies])

  const filteredMovies = useMemo(
    () =>
      allMovies.filter((movie) => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesGenre = selectedGenre === 'Tất cả' || movie.genre === selectedGenre
        return matchesSearch && matchesGenre
      }),
    [allMovies, searchTerm, selectedGenre],
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
      <Routes>
        <Route
          path="/"
          element={
            <MainContent
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              movies={filteredMovies}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onRetry={loadMovies}
              onMovieSelect={(movie) => navigate(`/movies/${movie.id}`)}
            />
          }
        />
        <Route path="/movies/:movieId" element={<MovieDetail movies={allMovies} />} />
      </Routes>
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export default App
