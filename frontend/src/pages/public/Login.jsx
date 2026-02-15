import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import SEO from '../../components/SEO'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user, redirectByRole } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate(redirectByRole(user.role), { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login(email, password)
      navigate(redirectByRole(u.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: 400 }}>
      <SEO title="Login" description="Sign in to Ultimate College of Technology student and staff portal." canonicalPath="/login" noindex />
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Login</h1>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/register">Register</Link> · <Link to="/">Back to home</Link>
        </p>
      </form>
    </div>
  )
}
