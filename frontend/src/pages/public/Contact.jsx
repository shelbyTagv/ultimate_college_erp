import { useEffect, useState } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'

export default function Contact() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    publicApi.settings().then(setSettings)
  }, [])

  return (
    <article className="container" style={{ padding: '2rem 0' }}>
      <SEO
        title="Contact Us"
        description="Contact Ultimate College of Technology – 2508 Mainway Meadows, Harare. Phone 07795977691. ZIMSEC high school."
        canonicalPath="/contact"
      />
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Contact Us</h1>
      <div className="card" style={{ maxWidth: 560 }}>
        <p><strong>{settings.name || 'Ultimate College of Technology'}</strong></p>
        <p><strong>Address:</strong> {settings.address || '2508 Mainway Meadows, Harare, Zimbabwe'}</p>
        <p><strong>Phone:</strong> {settings.phone || '07795977691'}</p>
        <p><strong>Examination authority:</strong> {settings.examination_authority || 'ZIMSEC'}</p>
      </div>
    </article>
  )
}
