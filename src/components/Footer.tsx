const links = [
  { label: 'Giới thiệu', targetId: 'home' },
  { label: 'Phim mới', targetId: 'movies' },
  { label: 'Top phim', targetId: 'ranking' },
  { label: 'Liên hệ', targetId: 'contact' },
]

interface FooterProps {
  onNavigate: (targetId: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <h3>MovieHub</h3>
          <p>Nền tảng tham khảo phim trực tuyến với giao diện tối giản và thân thiện.</p>
        </div>

        <ul className="footer-links">
          {links.map((link) => (
            <li key={link.label}>
              <button type="button" className="footer-link-button" onClick={() => onNavigate(link.targetId)}>
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <p className="footer-copy">© 2026 MovieHub. All rights reserved.</p>
      </div>
    </footer>
  )
}
