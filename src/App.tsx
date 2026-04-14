import { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Footer } from './components/Footer.tsx'
import { Header } from './components/Header'
import { MainContent } from './components/MainContent.tsx'
import { MovieDetail } from './components/MovieDetail.tsx'
import { movies } from './data/movies'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('Tất cả')
  const [pendingSection, setPendingSection] = useState<string | null>(null)

  const handleNavigate = (targetId: string) => {
    if (location.pathname !== '/') {
      setPendingSection(targetId)
      navigate('/')
      return
    }

    const target = document.getElementById(targetId)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (location.pathname === '/' && pendingSection) {
      const target = document.getElementById(pendingSection)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setPendingSection(null)
    }
  }, [location.pathname, pendingSection])

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
      <Routes>
        <Route
          path="/"
          element={
            <MainContent
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              movies={filteredMovies}
              onMovieSelect={(movie) => navigate(`/movies/${movie.id}`)}
            />
          }
        />
        <Route path="/movies/:movieId" element={<MovieDetail />} />
      </Routes>
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export default App
