import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'
import HeroSlider from '../../components/HeroSlider'
import AnimateOnScroll from '../../components/AnimateOnScroll'

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Ultimate College of Technology',
  description: 'High School (Form 1–Form 6) in Harare, Zimbabwe. ZIMSEC-aligned curriculum and examinations.',
  url: 'https://ultimatecollege.co.zw',
  telephone: '+2637795977691',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '2508 Mainway Meadows',
    addressLocality: 'Harare',
    addressCountry: 'ZW',
  },
  geo: {
    '@type': 'GeoCoordinates',
    addressCountry: 'ZW',
    addressRegion: 'Harare',
  },
  areaServed: { '@type': 'Country', name: 'Zimbabwe' },
}

/**
 * Configure slider slides here. Add your school images later:
 * { image: '/images/school-building.jpg', title: '...', subtitle: '...', cta: { label: 'Apply Now', to: '/admissions' } }
 * Leave image as '' for a gradient placeholder.
 */
const HERO_SLIDES = [
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

export default function Home() {
  const [settings, setSettings] = useState({})
  const [news, setNews] = useState([])

  useEffect(() => {
    publicApi.settings().then(setSettings)
    publicApi.news().then(setNews)
  }, [])

  const jsonLd = { ...ORGANIZATION_JSON_LD, name: settings.name || ORGANIZATION_JSON_LD.name, telephone: settings.phone || ORGANIZATION_JSON_LD.telephone }

  return (
    <>
      <SEO
        title="Home"
        description="Ultimate College of Technology – High School Form 1 to Form 6 in Harare, Zimbabwe. ZIMSEC examinations, admissions, and student portal. Apply online."
        canonicalPath="/"
        jsonLd={jsonLd}
      />

      <HeroSlider slides={HERO_SLIDES} interval={5500} />

      <section className="container section" style={{ padding: '3rem 0' }} aria-labelledby="why-us">
        <AnimateOnScroll>
          <h2 id="why-us" className="section-heading" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            Why Choose Us
          </h2>
        </AnimateOnScroll>
        <div className="features-grid">
          <AnimateOnScroll delay={0.1}>
            <div className="card">
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary)' }}>ZIMSEC Aligned</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Form 4 & Form 6 examination preparation under ZIMSEC.</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="card">
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary)' }}>Full Curriculum</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Forms 1–6 with streams and structured classes.</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.3}>
            <div className="card">
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--primary)' }}>Modern ERP</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Online portal for students, parents, and staff.</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {news.length > 0 && (
        <section className="section section--alt" style={{ padding: '3rem 0' }}>
          <div className="container">
            <AnimateOnScroll>
              <h2 className="section-heading" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                News & Events
              </h2>
            </AnimateOnScroll>
            <div className="news-preview">
              {news.slice(0, 3).map((n, i) => (
                <AnimateOnScroll key={n.id} delay={0.1 * (i + 1)}>
                  <div className="card">
                    <h4 style={{ margin: '0 0 0.5rem' }}>{n.title}</h4>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{n.event_date} · {n.content?.slice(0, 120)}...</p>
                    <Link to="/news" className="card-link">Read more</Link>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/news" className="btn btn-primary">All News</Link>
            </div>
          </div>
        </section>
      )}

      <AnimateOnScroll>
          <section className="container section" style={{ padding: '2rem 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{settings.address} · {settings.phone}</p>
        </section>
      </AnimateOnScroll>
    </>
  )
}
