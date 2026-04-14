interface NavItem {
  label: string
  targetId: string
}

interface HeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  navItems: NavItem[]
  onNavigate: (targetId: string) => void
}

export function Header({ searchTerm, onSearchChange, navItems, onNavigate }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        <button type="button" className="logo logo-button" onClick={() => onNavigate('home')}>
          MovieHub
        </button>

        <nav className="nav" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="nav-link nav-button"
              onClick={() => onNavigate(item.targetId)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm phim yêu thích..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="search-input"
            aria-label="Tìm kiếm phim"
          />
        </div>
      </div>
    </header>
  )
}
