import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function Register() {
  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: 560 }}>
      <SEO title="Register" description="New student registration – apply via Admissions. Staff accounts by administrator." canonicalPath="/register" noindex />
      <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Register</h1>
      <div className="card">
        <p>New students must apply through <strong>Admissions</strong>. After your application is approved, the school will create your account and send you login details.</p>
        <p>If you are staff (teacher, admin, finance), please contact the school administrator to get your account.</p>
        <Link to="/admissions" className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Go to Admissions</Link>
        <Link to="/login" className="btn btn-outline">Login</Link>
      </div>
    </div>
  )
}
