import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'
import PageBanner from '../../components/PageBanner'
import AnimateOnScroll from '../../components/AnimateOnScroll'

export default function NewsEvents() {
  const [news, setNews] = useState([])

  useEffect(() => {
    publicApi.news().then(setNews)
  }, [])

  return (
    <>
      <SEO
        title="News & Events"
        description="Latest news and events at Ultimate College of Technology – term dates, ZIMSEC registration, sports, and school updates. Harare, Zimbabwe."
        canonicalPath="/news"
      />
      <PageBanner title="News & Events" subtitle="Term dates, announcements & school life" />
      <div className="page-content">
        <article className="container">
          {news.length === 0 ? (
            <AnimateOnScroll>
              <div className="card">No news or events at the moment.</div>
            </AnimateOnScroll>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {news.map((n, i) => (
                <AnimateOnScroll key={n.id} delay={i * 0.08}>
                  <div className="card">
                    <h3 style={{ margin: '0 0 0.5rem' }}>{n.title}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{n.event_date}</p>
                    <p style={{ margin: '0.5rem 0 0' }}>{n.content}</p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </article>
      </div>
    </>
  )
}
