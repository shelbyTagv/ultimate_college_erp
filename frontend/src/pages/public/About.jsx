import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'

export default function About() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    publicApi.settings().then(setSettings)
  }, [])

  return (
    <article className="container" style={{ padding: '2rem 0' }}>
      <SEO
        title="About Us"
        description="Learn about Ultimate College of Technology – High School Form 1–6 in Harare, Zimbabwe. ZIMSEC curriculum, location, and contact."
        canonicalPath="/about"
      />
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>About Us</h1>
      <div className="card" style={{ maxWidth: 720 }}>
        <p><strong>{settings.name || 'Ultimate College of Technology'}</strong> is a high school offering Forms 1–6 in Harare, Zimbabwe, under the ZIMSEC examination authority.</p>
        <p>We provide a structured academic environment with streams and classes, continuous assessment, term and final examinations, and dedicated support for Form 4 and Form 6 candidates.</p>
        <p><strong>Location:</strong> {settings.address || '2508 Mainway Meadows, Harare, Zimbabwe'}</p>
        <p><strong>Contact:</strong> {settings.phone || '07795977691'}</p>
      </div>
    </article>
  )
}
