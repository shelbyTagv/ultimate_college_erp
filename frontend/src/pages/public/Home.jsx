import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'
import HeroSlider from '../../components/HeroSlider'
import StatsSection from '../../components/StatsSection'
import AnimateOnScroll from '../../components/AnimateOnScroll'
import { GraduationCap, BookOpen, Clock, Award, Users, Globe } from 'lucide-react'

// Organization Schema (kept as is)
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Ultimate College of Technology',
  description: 'High School (Form 1–Form 6) in Harare, Zimbabwe. ZIMSEC-aligned curriculum and examinations.',
  url: 'https://ultimatecollege.co.zw',
  telephone: '07795977691',
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

export default function Home() {
  const [settings, setSettings] = useState({})
  const [news, setNews] = useState([])

  useEffect(() => {
    // Graceful degradation if API fails
    publicApi.settings().then(setSettings).catch(err => console.error("Failed to load settings", err))
    publicApi.news().then(setNews).catch(err => console.error("Failed to load news", err))
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

      <HeroSlider />

      <StatsSection />

      {/* Academic Excellence Section */}
      <section className="container section" style={{ padding: '5rem 0' }}>
        <div className="text-center mb-5">
          <AnimateOnScroll>
            <h2 className="section-heading">Why Choose Ultimate College?</h2>
            <p className="section-subheading">A commitment to discipline, integrity, and academic success.</p>
          </AnimateOnScroll>
        </div>

        <div className="features-grid">
          <AnimateOnScroll delay={0.1}>
            <div className="feature-card">
              <div className="feature-icon"><GraduationCap size={32} /></div>
              <h3>ZIMSEC Excellence</h3>
              <p>Rigorous preparation for Form 4 & Form 6 examinations with a focus on achieving top grades.</p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.2}>
            <div className="feature-card">
              <div className="feature-icon"><BookOpen size={32} /></div>
              <h3>Holistic Curriculum</h3>
              <p>A balanced education covering Sciences, Arts, and Commercials, enriched with practical learning.</p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.3}>
            <div className="feature-card">
              <div className="feature-icon"><Users size={32} /></div>
              <h3>Expert Faculty</h3>
              <p>Highly qualified and dedicated teachers committed to extracting the best from every student.</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Values / Vision Parallel Section */}
      <section className="values-section">
        <div className="container">
          <div className="values-grid">
            <AnimateOnScroll>
              <div className="value-content">
                <h2 className="section-heading text-white">Our Vision</h2>
                <p className="lead-text">
                  To be the premier institution of learning in Zimbabwe, nurturing leaders who maintain high standards of discipline, ethics, and academic prowess in a rapidly evolving global landscape.
                </p>
                <div className="value-list">
                  <div className="value-item">
                    <Award className="value-icon" />
                    <div>
                      <strong>Excellence</strong>
                      <p>We strive for the highest standards in everything we do.</p>
                    </div>
                  </div>
                  <div className="value-item">
                    <Globe className="value-icon" />
                    <div>
                      <strong>Global Mindset</strong>
                      <p>Preparing students for opportunities within and beyond Zimbabwe.</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
            <div className="value-image-wrap">
              {/* Abstract academic image pattern */}
              <div className="value-pattern"></div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      {news.length > 0 && (
        <section className="section section--alt" style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
              <AnimateOnScroll>
                <div>
                  <h2 className="section-heading" style={{ marginBottom: '0.5rem' }}>Campus News</h2>
                  <p className="text-muted">Latest updates and events from our community.</p>
                </div>
              </AnimateOnScroll>
              <Link to="/news" className="btn btn-outline btn-arrow">View All News &rarr;</Link>
            </div>

            <div className="news-preview">
              {news.slice(0, 3).map((n, i) => (
                <AnimateOnScroll key={n.id} delay={0.1 * (i + 1)}>
                  <Link to="/news" className="news-card">
                    <div className="news-date">
                      <span className="day">{new Date(n.event_date).getDate()}</span>
                      <span className="month">{new Date(n.event_date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="news-content">
                      <h4>{n.title}</h4>
                      <p>{n.content?.slice(0, 100)}...</p>
                      <span className="read-more">Read Article</span>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container text-center">
          <AnimateOnScroll>
            <h2>Begin Your Journey With Us</h2>
            <p>Applications for {new Date().getFullYear() + 1} are now open. Secure your place today.</p>
            <div className="cta-buttons">
              <Link to="/admissions" className="btn btn-secondary btn-lg">Apply Now</Link>
              <Link to="/contact" className="btn btn-outline-white">Schedule a Visit</Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <style>{`
        .text-center { text-align: center; }
        .mb-5 { margin-bottom: 3rem; }
        .text-muted { color: var(--text-muted); }
        .text-white { color: white !important; }
        
        .section-subheading {
          font-size: 1.1rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0.5rem auto 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
        }

        .feature-card {
          padding: 2.5rem 2rem;
          background: var(--neutral);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          transition: transform var(--transition);
          border: 1px solid var(--border);
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: rgba(13, 59, 46, 0.2);
        }

        .feature-icon {
          color: var(--primary);
          background: rgba(13, 59, 46, 0.05);
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .values-section {
          background: var(--primary-dark);
          color: var(--neutral);
          padding: 6rem 0;
          overflow: hidden;
          position: relative;
        }

        .values-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }
        
        @media (min-width: 900px) {
            .values-grid {
                grid-template-columns: 1fr 1fr;
                align-items: center;
            }
        }

        .lead-text {
          font-size: 1.15rem;
          line-height: 1.7;
          opacity: 0.9;
          margin-bottom: 2.5rem;
        }

        .value-item {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .value-icon {
          color: var(--secondary);
          min-width: 24px;
          margin-top: 4px;
        }

        .value-image-wrap {
            height: 100%;
            min-height: 300px;
            background: rgba(255,255,255,0.05);
            border-radius: var(--radius);
            position: relative;
        }
        
        .value-pattern {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0);
            background-size: 24px 24px;
        }

        .news-card {
          display: flex;
          background: var(--neutral);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: transform var(--transition);
          color: var(--text);
          height: 100%;
          border: 1px solid var(--border);
        }

        .news-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          text-decoration: none;
        }

        .news-date {
          background: var(--primary-light);
          color: white;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          text-align: center;
        }

        .day { font-size: 1.5rem; font-weight: 700; line-height: 1; }
        .month { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }

        .news-content {
          padding: 1.5rem;
        }

        .news-content h4 {
          font-size: 1.1rem;
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: var(--primary);
        }

        .read-more {
          color: var(--secondary-dark);
          font-weight: 600;
          font-size: 0.85rem;
          margin-top: 1rem;
          display: inline-block;
        }

        .cta-section {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: var(--neutral);
          padding: 6rem 0;
        }

        .cta-section h2 { color: white; margin-bottom: 1rem; }
        .cta-section p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .btn-arrow {
            display: inline-flex;
            align-items: center;
        }
      `}</style>
    </>
  )
}
