import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { classesApi, reportsApi, financeApi, applicationsApi } from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ enrollment: [], summary: {}, pendingApps: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportsApi.enrollment().catch(() => []),
      financeApi.summary().catch(() => ({})),
      applicationsApi.list({ status: 'PENDING', limit: 100 }).catch(() => []),
    ]).then(([enrollment, summary, apps]) => {
      setStats({
        enrollment: Array.isArray(enrollment) ? enrollment : [],
        summary: summary || {},
        pendingApps: Array.isArray(apps) ? apps.length : 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading dashboard...</p>

  const totalStudents = stats.enrollment.reduce((s, r) => s + (r.student_count || 0), 0)

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total students</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalStudents}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fees collected</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${stats.summary.total_paid ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Outstanding</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${stats.summary.outstanding ?? 0}</div>
        </div>
        <Link to="/admin/applications" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending applications</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary-dark)' }}>{stats.pendingApps}</div>
        </Link>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Enrollment by class</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Class</th><th>Form</th><th>Stream</th><th>Students</th></tr>
            </thead>
            <tbody>
              {stats.enrollment.map((r) => (
                <tr key={r.class_name}>
                  <td>{r.class_name}</td>
                  <td>{r.form_name}</td>
                  <td>{r.stream_name}</td>
                  <td>{r.student_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
