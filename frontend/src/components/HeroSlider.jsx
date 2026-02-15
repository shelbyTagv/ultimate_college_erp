import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const SLIDES = [
  {
    image: 'https://www.google.com/imgres?q=zimbabwean%20colleges%20college&imgurl=https%3A%2F%2Fcdn.thestandard.co.zw%2Fnewsday%2Fuploads%2F2016%2F02%2Fschools-banner4.jpg&imgrefurl=https%3A%2F%2Fwww.newsday.co.zw%2Fnews%2Farticle%2F91959%2Fhigh-pass-rate-at-st-ignatius-college&docid=6CZl_QwrD7yPTM&tbnid=bdeLnZsFDYtxxM&vet=12ahUKEwi-iYOf8NuSAxWjW0EAHQ3KNVAQnPAOegQIRRAB..i&w=920&h=500&hcb=2&ved=2ahUKEwi-iYOf8NuSAxWjW0EAHQ3KNVAQnPAOegQIRRAB', // Brick University Building (No people)
    title: 'Excellence in Form 4 & Form 6',
    subtitle: 'Premier ZIMSEC examination center producing top results in Harare.',
    cta: { label: 'Apply for Form 1-6', to: '/admissions' },
  },
  {
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=2574&auto=format&fit=crop', // Library/Study Hall (Architecture/Empty)
    title: 'A Foundation for Success',
    subtitle: 'Disciplined academic environment located at 2508 Mainway Meadows.',
    cta: { label: 'Explore Our Campus', to: '/about' },
  },
  {
    image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=2574&auto=format&fit=crop', // Academic Building/Trees
    title: 'Ultimate College of Technology',
    subtitle: 'Empowering future leaders with technical and academic skills.',
    cta: { label: 'Contact Us', to: '/contact' },
  },
]

export default function HeroSlider() {
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [next])

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section className="hero-section" aria-label="Welcome to Ultimate College">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === active ? 'active' : ''}`}
          aria-hidden={i !== active}
        >
          <div
            className="hero-bg"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="hero-overlay" />

          <div className="hero-content container">
            <div className="content-wrapper">
              <span className={`hero-badge ${i === active ? 'animate-reveal' : ''}`}>
                <strong>Ultimate College of Technology</strong> •
                2508 Mainway Meadows, Harare, Zimbabwe •
                ZIMSEC Accredited (Forms 1–6)
              </span>

              <h1 className={`hero-title ${i === active ? 'animate-up' : ''}`}>
                {slide.title}
              </h1>
              <p className={`hero-subtitle ${i === active ? 'animate-up-delay' : ''}`}>
                {slide.subtitle}
              </p>
              <div className={`hero-actions ${i === active ? 'animate-up-delay-2' : ''}`}>
                <Link to={slide.cta.to} className="btn btn-secondary btn-lg">
                  {slide.cta.label}
                </Link>
                <Link to="/contact" className="btn btn-outline-white btn-lg">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="hero-indicators">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`indicator ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        .hero-section {
          position: relative;
          height: 100vh;
          min-height: 600px;
          overflow: hidden;
          background: var(--primary-dark);
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s ease-in-out;
          z-index: 1;
        }

        .hero-slide.active {
          opacity: 1;
          z-index: 2;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1.1);
          transition: transform 8s ease-out;
        }

        .hero-slide.active .hero-bg {
          transform: scale(1);
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(8, 40, 31, 0.4) 0%,
            rgba(8, 40, 31, 0.7) 60%,
            rgba(8, 40, 31, 0.9) 100%
          );
        }

        .hero-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          z-index: 10;
          color: var(--neutral);
        }

        .content-wrapper {
          max-width: 800px;
        }

        .hero-badge {
          display: inline-block;
          font-family: var(--font);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 0.85rem;
          color: var(--secondary);
          margin-bottom: 1.5rem;
          opacity: 0;
          transform: translateY(20px);
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--neutral);
          opacity: 0;
          transform: translateY(30px);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 2.5rem;
          max-width: 600px;
          opacity: 0;
          transform: translateY(30px);
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          opacity: 0;
          transform: translateY(30px);
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1rem;
          letter-spacing: 0.02em;
        }

        .btn-outline-white {
          border: 2px solid rgba(255,255,255,0.3);
          color: var(--neutral);
          background: transparent;
        }

        .btn-outline-white:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--neutral);
        }

        /* Animations */
        .animate-reveal {
          animation: fadeInUp var(--transition-slow) forwards 0.2s;
        }

        .animate-up {
          animation: fadeInUp var(--transition-slow) forwards 0.4s;
        }

        .animate-up-delay {
          animation: fadeInUp var(--transition-slow) forwards 0.6s;
        }

        .animate-up-delay-2 {
          animation: fadeInUp var(--transition-slow) forwards 0.8s;
        }

        .hero-indicators {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 0.8rem;
        }

        .indicator {
          width: 60px;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.3s ease;
          border-radius: 2px;
        }

        .indicator.active {
          background: var(--secondary);
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .hero-subtitle { font-size: 1.1rem; }
          .hero-actions { flex-direction: column; width: 100%; }
          .btn-lg { width: 100%; }
        }
      `}</style>
    </section>
  )
}
