import { useEffect, useState } from 'react'
import { applicationsApi, classesApi } from '../../services/api'

export default function AdminApplications() {
  const [list, setList] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')

  const load = () => {
    setLoading(true)
    applicationsApi.list({ status: statusFilter || undefined, limit: 100 })
      .then(setList)
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [statusFilter])

  const handleReview = (appId, approve) => {
    setReviewing(appId)
    applicationsApi.review(appId, { status: approve ? 'APPROVED' : 'REJECTED', review_notes: reviewNotes })
      .then(() => { setReviewNotes(''); setReviewing(null); load() })
      .catch(() => setReviewing(null))
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Applications</h1>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Form</th>
                <th>Stream</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.first_name} {a.last_name}</td>
                  <td>{a.email}</td>
                  <td>{a.desired_form}</td>
                  <td>{a.intended_stream}</td>
                  <td><span className={`badge badge-${a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'danger' : 'warning'}`}>{a.status}</span></td>
                  <td>{a.created_at?.slice(0, 10)}</td>
                  <td>
                    {a.status === 'PENDING' && (
                      <>
                        <textarea placeholder="Notes" value={reviewing === a.id ? reviewNotes : ''} onChange={e => setReviewNotes(e.target.value)} rows={1} style={{ width: 120, marginRight: 4 }} />
                        <button type="button" className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', marginRight: 4 }} onClick={() => handleReview(a.id, true)} disabled={reviewing}>Approve</button>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleReview(a.id, false)} disabled={reviewing}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p style={{ padding: '1rem' }}>No applications.</p>}
        </div>
      )}
    </div>
  )
}
