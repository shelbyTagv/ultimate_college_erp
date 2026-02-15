import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentsApi, assignmentsApi, resultsApi } from '../../services/api'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentsApi.me().then(setProfile).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!profile?.student_id) return
    assignmentsApi.list({ student_id: profile.student_id }).then(setAssignments).catch(() => [])
  }, [profile?.student_id])

  if (loading && !profile) return <p>Loading...</p>

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Student Dashboard</h1>
      {profile && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Welcome, {profile.first_name} {profile.last_name}. {profile.class_name && <>Class: <strong>{profile.class_name}</strong> ({profile.form_name})</>}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/student/assignments" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assignments</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>View & submit</div>
        </Link>
        <Link to="/student/results" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Results</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>View marks</div>
        </Link>
        <Link to="/student/fees" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fees</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Invoices & payments</div>
        </Link>
        <Link to="/student/library" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Library</div>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Digital resources</div>
        </Link>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Recent assignments</h2>
        {assignments.length === 0 ? <p>No assignments.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th>Marks</th></tr></thead>
              <tbody>
                {assignments.slice(0, 10).map(a => <tr key={a.id}><td>{a.title}</td><td>{a.subject_name}</td><td>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}</td><td>{a.marks != null ? a.marks : '-'}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
