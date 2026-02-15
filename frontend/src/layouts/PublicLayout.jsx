import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEffect, useState } from 'react'

export default function PublicLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <header className={`public-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          <Link to="/" className="brand-logo" aria-label="Ultimate College of Technology – Home">
            <span className="brand-icon">🎓</span>
            <div className="brand-text">
              <span className="brand-name">Ultimate College</span>
              <span className="brand-tagline">of Technology</span>
            </div>
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
            <Link to="/admissions" className={location.pathname === '/admissions' ? 'active' : ''}>Admissions</Link>
            <Link to="/academics" className={location.pathname === '/academics' ? 'active' : ''}>Academics</Link>
            <Link to="/news" className={location.pathname === '/news' ? 'active' : ''}>News</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>

            <div className="nav-divider"></div>

            {user ? (
              <Link to={getDashboardLink(user.role)} className="btn btn-sm btn-primary">
                Dashboard
              </Link>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="nav-link-login">Portal Login</Link>
                <Link to="/admissions" className="btn btn-sm btn-secondary">Apply Now</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="page-wrap page-wrap--public" role="main" id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h3 className="footer-heading">Ultimate College</h3>
            <p>Empowering global leaders through academic excellence and disciplined character.</p>
            <address>
              2508 Mainway Meadows<br />
              Harare, Zimbabwe<br />
              <a href="tel:07795977691">0779 597 7691</a>
            </address>
          </div>

          <div className="footer-links">
            <h4 className="footer-subheading">Academics</h4>
            <ul>
              <li><Link to="/academics">Curriculum (ZIMSEC)</Link></li>
              <li><Link to="/admissions">Admissions</Link></li>
              <li><Link to="/news">Academic Calendar</Link></li>
              <li><Link to="/about">Results (Form 4 & 6)</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-subheading">Quick Links</h4>
            <ul>
              <li><Link to="/login">Student Portal</Link></li>
              <li><Link to="/login">Staff Portal</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/about">History</Link></li>
            </ul>
          </div>

          <div className="footer-legal">
            <p>&copy; {new Date().getFullYear()} Ultimate College of Technology. All rights reserved.</p>
            <p className="tagv-credit">Website created by TaGV Engineering Solutions (Pvt)Ltd 2026</p>
          </div>
        </div>
      </footer>

      <style>{`
        .public-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1rem 0;
          transition: all 0.4s ease;
          background: rgba(255, 255, 255, 0);
          color: var(--neutral);
        }
        
        .public-header.scrolled {
          background: rgba(13, 59, 46, 0.95);
          backdrop-filter: blur(12px);
          padding: 0.75rem 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--neutral);
        }

        .brand-icon {
          font-size: 2rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .brand-name {
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.01em;
        }

        .brand-tagline {
          font-size: 0.75rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .main-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .main-nav a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .main-nav a:not(.btn):hover,
        .main-nav a.active {
          color: var(--secondary);
          opacity: 1;
        }

        .main-nav a:not(.btn)::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--secondary);
          transition: width 0.3s ease;
        }

        .main-nav a:not(.btn):hover::after,
        .main-nav a.active::after {
          width: 100%;
        }

        .nav-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.2);
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .btn-sm {
          padding: 0.5rem 1.25rem;
          font-size: 0.9rem;
        }

        .site-footer {
          background: var(--primary-dark);
          color: #ffffff; /* Explicit white for all text */
          padding: 4rem 0 2rem;
          font-size: 0.95rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .footer-heading {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          color: #ffffff;
          margin-bottom: 1rem;
        }

        .footer-subheading {
          color: var(--secondary);
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }

        .footer-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 0.75rem;
        }
        
        .footer-links a {
            color: rgba(255, 255, 255, 0.9);
        }

        .footer-links a:hover {
          color: var(--secondary);
          text-decoration: none;
          padding-left: 4px;
        }

        .footer-legal {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 2rem;
          text-align: center;
          font-size: 0.85rem;
          opacity: 0.8;
          color: #ffffff;
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: center;
        }
        
        .tagv-credit {
            font-weight: 500;
            opacity: 0.9;
            letter-spacing: 0.02em;
        }

        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            gap: 1rem;
          }
          .main-nav {
            gap: 1rem;
            font-size: 0.85rem;
            flex-wrap: wrap;
            justify-content: center;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}

function getDashboardLink(role) {
  switch (role) {
    case 'ADMIN_STAFF': return '/admin'
    case 'SUPER_ADMIN': return '/admin'
    case 'TEACHER': return '/teacher'
    case 'STUDENT': return '/student'
    case 'PARENT': return '/parent'
    default: return '/finance'
  }
}

