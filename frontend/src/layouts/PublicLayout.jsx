import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function PublicLayout() {
  const { user } = useAuth()

  return (
    <>
      <header className="public-header" style={headerStyle} role="banner">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/" style={{ color: 'var(--neutral)', fontWeight: 700, fontSize: '1.25rem' }} aria-label="Ultimate College of Technology – Home">
            Ultimate College of Technology
          </Link>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} aria-label="Main navigation">
            <Link to="/about" style={navLink}>About</Link>
            <Link to="/admissions" style={navLink}>Admissions</Link>
            <Link to="/academics" style={navLink}>Academics</Link>
            <Link to="/news" style={navLink}>News & Events</Link>
            <Link to="/contact" style={navLink}>Contact</Link>
            {user ? (
              <Link to={user.role === 'ADMIN_STAFF' || user.role === 'SUPER_ADMIN' ? '/admin' : user.role === 'TEACHER' ? '/teacher' : user.role === 'STUDENT' ? '/student' : user.role === 'PARENT' ? '/parent' : '/finance'} style={navLink}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" style={navLink}>Login</Link>
                <Link to="/register" style={{ ...navLink, background: 'var(--secondary)', color: 'var(--text)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius)' }}>Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main style={{ minHeight: 'calc(100vh - 140px)' }} role="main" id="main-content">
        <Outlet />
      </main>
      <footer className="site-footer" style={footerStyle} role="contentinfo">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Ultimate College of Technology</strong><br />
            2508 Mainway Meadows, Harare, Zimbabwe<br />
            Tel: 07795977691 | ZIMSEC
          </div>
          <div>
            <Link to="/contact" style={{ color: 'var(--secondary)' }}>Contact Us</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

const headerStyle = {
  background: 'var(--primary)',
  color: 'var(--neutral)',
  padding: '1rem 0',
  boxShadow: 'var(--shadow-md)',
}

const navLink = {
  color: 'var(--neutral)',
  textDecoration: 'none',
  fontWeight: 500,
}

const footerStyle = {
  background: 'var(--primary-dark)',
  color: 'rgba(255,255,255,0.9)',
  padding: '1.5rem 0',
  marginTop: '2rem',
}
