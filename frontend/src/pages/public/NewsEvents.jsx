import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'

export default function NewsEvents() {
  const [news, setNews] = useState([])

  useEffect(() => {
    publicApi.news().then(setNews)
  }, [])

  return (
    <article className="container" style={{ padding: '2rem 0' }}>
      <SEO
        title="News & Events"
        description="Latest news and events at Ultimate College of Technology – term dates, ZIMSEC registration, sports, and school updates. Harare, Zimbabwe."
        canonicalPath="/news"
      />
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>News & Events</h1>
      {news.length === 0 ? (
        <div className="card">No news or events at the moment.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {news.map((n) => (
            <div key={n.id} className="card">
              <h3 style={{ margin: '0 0 0.5rem' }}>{n.title}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{n.event_date}</p>
              <p style={{ margin: '0.5rem 0 0' }}>{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
