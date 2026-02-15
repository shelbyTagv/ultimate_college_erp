import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teachersApi, assignmentsApi } from '../../services/api'

export default function TeacherDashboard() {
  const [profile, setProfile] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([teachersApi.me(), assignmentsApi.list()]).then(([p, a]) => {
      setProfile(p)
      setAssignments(Array.isArray(a) ? a.slice(0, 10) : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Teacher Dashboard</h1>
      {profile && <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Welcome, {profile.first_name} {profile.last_name}. You are assigned to {profile.classes?.length || 0} class(es).</p>}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>Quick links</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/teacher/classes" className="btn btn-primary">My classes</Link>
          <Link to="/teacher/assignments" className="btn btn-secondary">Assignments</Link>
          <Link to="/teacher/attendance" className="btn btn-outline">Attendance</Link>
          <Link to="/teacher/results" className="btn btn-outline">Results</Link>
        </div>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Recent assignments</h2>
        {assignments.length === 0 ? <p>No assignments yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Class</th><th>Subject</th><th>Due</th></tr></thead>
              <tbody>
                {assignments.map(a => <tr key={a.id}><td>{a.title}</td><td>{a.class_name}</td><td>{a.subject_name}</td><td>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
