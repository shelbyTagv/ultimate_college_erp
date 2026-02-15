import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'

export default function Register() {
  return (
    <div className="page-content">
      <div className="container" style={{ padding: '2.5rem 0', maxWidth: 560 }}>
        <SEO title="Register" description="New student registration – apply via Admissions. Staff accounts by administrator." canonicalPath="/register" noindex />
        <div className="animate-in">
          <h1 style={{ color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>Register</h1>
          <div className="card">
            <p>New students must apply through <strong>Admissions</strong>. After your application is approved, the school will create your account and send you login details.</p>
            <p>If you are staff (teacher, admin, finance), please contact the school administrator to get your account.</p>
            <Link to="/admissions" className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Go to Admissions</Link>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
