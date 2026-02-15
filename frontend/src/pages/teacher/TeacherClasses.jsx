import { useEffect, useState } from 'react'
import { teachersApi } from '../../services/api'

export default function TeacherClasses() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teachersApi.me().then(setProfile).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My classes</h1>
      <div className="card">
        {!profile?.classes?.length ? <p>No classes assigned.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Class</th><th>Subject</th></tr></thead>
              <tbody>
                {profile.classes.map(c => <tr key={c.class_id}><td>{c.class_name}</td><td>{c.subject_name}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
