import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const adminNav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/classes', label: 'Classes' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/teachers', label: 'Teachers' },
  { to: '/admin/finance', label: 'Finance' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/messages', label: 'Messages' },
]

const teacherNav = [
  { to: '/teacher', label: 'Dashboard' },
  { to: '/teacher/classes', label: 'My Classes' },
  { to: '/teacher/assignments', label: 'Assignments' },
  { to: '/teacher/attendance', label: 'Attendance' },
  { to: '/teacher/results', label: 'Results' },
  { to: '/teacher/messages', label: 'Messages' },
]

const studentNav = [
  { to: '/student', label: 'Dashboard' },
  { to: '/student/assignments', label: 'Assignments' },
  { to: '/student/results', label: 'Results' },
  { to: '/student/fees', label: 'Fees' },
  { to: '/student/library', label: 'Library' },
  { to: '/student/messages', label: 'Messages' },
]

const parentNav = [
  { to: '/parent', label: 'Dashboard' },
  { to: '/parent/messages', label: 'Messages' },
]

const financeNav = [
  { to: '/finance', label: 'Finance' },
  { to: '/finance/messages', label: 'Messages' },
]

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const nav = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : role === 'student' ? studentNav : role === 'parent' ? parentNav : financeNav
  const base = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : role === 'student' ? '/student' : role === 'parent' ? '/parent' : '/finance'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: sidebarOpen ? 260 : 0,
        minWidth: sidebarOpen ? 260 : 0,
        background: 'var(--primary)',
        color: 'var(--neutral)',
        transition: 'width 0.2s',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 10,
      }}>
        <div style={{ padding: '1rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>Ultimate College</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  color: location.pathname === to ? 'var(--secondary)' : 'rgba(255,255,255,0.9)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === to ? 600 : 400,
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: 0,
            top: 10,
            zIndex: 20,
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 0.75rem',
            borderRadius: '0 var(--radius) var(--radius) 0',
            cursor: 'pointer',
          }}
        >
          ☰
        </button>
      )}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            left: 250,
            top: 10,
            zIndex: 20,
            background: 'var(--neutral)',
            border: '1px solid var(--border)',
            padding: '0.5rem',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      )}

      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          background: 'var(--neutral)',
          padding: '0.75rem 1.5rem',
          boxShadow: 'var(--shadow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text)' }}>ERP Portal</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {user?.first_name || user?.email} ({user?.role})
            </span>
            <Link to="/" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Website</Link>
            <button type="button" className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Logout</button>
          </div>
        </header>
        <main className="dashboard-page" style={{ flex: 1, padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
