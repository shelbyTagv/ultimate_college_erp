import { useState, useEffect } from 'react'
import { publicApi } from '../../services/api'
import SEO from '../../components/SEO'
import PageBanner from '../../components/PageBanner'
import AnimateOnScroll from '../../components/AnimateOnScroll'

export default function Admissions() {
  const [forms, setForms] = useState([])
  const [streams, setStreams] = useState([])
  const [selectedFormId, setSelectedFormId] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    desired_form_id: '',
    intended_stream_id: '',
  })

  useEffect(() => {
    publicApi.forms().then(setForms)
  }, [])

  useEffect(() => {
    if (selectedFormId) publicApi.streams(selectedFormId).then(setStreams)
    else setStreams([])
  }, [selectedFormId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.desired_form_id || !formData.intended_stream_id) {
      setError('Please select desired form and stream.')
      return
    }
    setLoading(true)
    try {
      await publicApi.submitApplication(formData)
      setSent(true)
      setFormData({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '', desired_form_id: '', intended_stream_id: '' })
      setSelectedFormId('')
    } catch (err) {
      setError(err.message || 'Submission failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO
        title="Admissions"
        description="Apply to Ultimate College of Technology – Online application for Form 1 to Form 6. Select form and stream, submit documents. Harare, Zimbabwe."
        canonicalPath="/admissions"
      />
      <PageBanner title="Admissions" subtitle="Apply for Form 1–6 · Select form and stream" />

      {sent ? (
        <div className="page-content">
          <AnimateOnScroll>
            <div className="container" style={{ maxWidth: 560 }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <h2 style={{ color: 'var(--primary)' }}>Application Received</h2>
                <p>Your application has been submitted. Our team will review it and contact you by phone or message to confirm whether a place has been offered. If offered, you will be given login credentials so you can access the student portal.</p>
                <p>Once you have received confirmation and your login, please follow the instructions in the portal to pay school fees and complete enrollment. You may be asked to upload documents (birth certificate, previous results) during this process.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      ) : (
        <div className="page-content">
          <article className="container" style={{ maxWidth: 640 }}>
            <AnimateOnScroll>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>How to apply</h3>
                <ol style={{ margin: '0 0 0 1.25rem', color: 'var(--text-muted)' }}>
                  <li>Fill in the application form with the student's details and submit. Wait for our review and approval.</li>
                  <li>We will review your application and contact you by phone or message to confirm the placement and provide login credentials.</li>
                  <li>After you receive confirmation and your login details, proceed to pay the required school fees and complete enrollment. You may be asked to upload supporting documents (birth certificate, previous results) during this process.</li>
                </ol>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
              <form onSubmit={handleSubmit} className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>First name *</label>
                    <input required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Last name *</label>
                    <input required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Date of birth</label>
                    <input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Desired form *</label>
                    <select required value={formData.desired_form_id} onChange={e => { setFormData({ ...formData, desired_form_id: e.target.value, intended_stream_id: '' }); setSelectedFormId(e.target.value); }}>
                      <option value="">Select</option>
                      {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Intended stream *</label>
                    <select required value={formData.intended_stream_id} onChange={e => setFormData({ ...formData, intended_stream_id: e.target.value })} disabled={!selectedFormId}>
                      <option value="">Select</option>
                      {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                {error && <p className="error-msg">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </AnimateOnScroll>
          </article>
        </div>
      )}
    </>
  )
}
