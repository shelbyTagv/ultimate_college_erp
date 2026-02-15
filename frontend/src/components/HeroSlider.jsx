import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

/**
 * Hero slider for the home page.
 * Pass slides as: [{ image: '/path/to/image.jpg', title: '...', subtitle: '...', cta: { label: '...', to: '/path' } }, ...]
 * Add your school photos: put images in frontend/public/images/ and set image: '/images/your-photo.jpg'.
 * Omit image or use '' for a gradient placeholder.
 */
const DEFAULT_SLIDES = [
  {
    image: '',
    title: 'Welcome to Ultimate College of Technology',
    subtitle: 'Form 1 – Form 6 · ZIMSEC · Harare, Zimbabwe',
    cta: { label: 'Apply Now', to: '/admissions' },
  },
  {
    image: '',
    title: 'Excellence in Education',
    subtitle: 'Structured curriculum, dedicated teachers, and modern facilities.',
    cta: { label: 'Learn More', to: '/about' },
  },
  {
    image: '',
    title: 'Your Future Starts Here',
    subtitle: 'Join a community committed to academic success and character building.',
    cta: { label: 'Contact Us', to: '/contact' },
  },
]

export default function HeroSlider({ slides = DEFAULT_SLIDES, interval = 5500 }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((index) => {
    setActive((prev) => (index + slides.length) % slides.length)
  }, [slides.length])

  const next = useCallback(() => {
    goTo(active + 1)
  }, [active, goTo])

  const prev = useCallback(() => {
    goTo(active - 1)
  }, [active, goTo])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, interval)
    return () => clearInterval(t)
  }, [paused, next, interval])

  return (
    <section
      className="hero-slider"
      aria-label="Featured slides"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slider__track">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`hero-slider__slide ${i === active ? 'hero-slider__slide--active' : ''}`}
            aria-hidden={i !== active}
          >
            <div
              className="hero-slider__bg"
              style={
                slide.image
                  ? { backgroundImage: `url(${slide.image})` }
                  : {
                      background: `linear-gradient(135deg, var(--primary) ${20 + i * 15}%, var(--primary-dark) 100%)`,
                    }
              }
            />
            <div className="hero-slider__overlay" />
            <div className="hero-slider__content container">
              <h1 className="hero-slider__title">{slide.title}</h1>
              {slide.subtitle && <p className="hero-slider__subtitle">{slide.subtitle}</p>}
              {slide.cta && (
                <Link to={slide.cta.to} className="btn btn-secondary hero-slider__cta">
                  {slide.cta.label}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="hero-slider__nav hero-slider__nav--prev"
        onClick={prev}
        aria-label="Previous slide"
      >
        <span aria-hidden>‹</span>
      </button>
      <button
        type="button"
        className="hero-slider__nav hero-slider__nav--next"
        onClick={next}
        aria-label="Next slide"
      >
        <span aria-hidden>›</span>
      </button>

      <div className="hero-slider__dots" role="tablist" aria-label="Slide navigation">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Go to slide ${i + 1}`}
            className={`hero-slider__dot ${i === active ? 'hero-slider__dot--active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  )
}
