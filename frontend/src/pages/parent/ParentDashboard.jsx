import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { parentsApi, resultsApi, financeApi } from '../../services/api'

export default function ParentDashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    parentsApi.me().then(setProfile).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Parent Dashboard</h1>
      {profile && <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Welcome, {profile.first_name} {profile.last_name}. Linked students: {profile.students?.length || 0}.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {profile?.students?.map(s => (
          <div key={s.id} className="card">
            <h3 style={{ margin: '0 0 0.5rem' }}>{s.first_name} {s.last_name}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.relationship || 'Student'}</p>
            <div style={{ marginTop: '0.75rem' }}>
              <Link to={`#student-${s.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', marginRight: 4 }}>View results</Link>
              <Link to="/parent/messages" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>Message</Link>
            </div>
          </div>
        ))}
        {(!profile?.students?.length) && <p>No linked students.</p>}
      </div>
    </div>
  )
}
