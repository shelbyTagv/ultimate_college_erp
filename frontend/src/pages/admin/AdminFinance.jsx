import { useEffect, useState } from 'react'
import { financeApi, classesApi } from '../../services/api'

export default function AdminFinance() {
  const [summary, setSummary] = useState({})
  const [debtors, setDebtors] = useState([])
  const [invoices, setInvoices] = useState([])
  const [years, setYears] = useState([])
  const [ayId, setAyId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classesApi.academicYears().then(y => { setYears(y); setAyId(y.find(ay => ay.is_current)?.id || y[0]?.id || '') })
  }, [])

  useEffect(() => {
    if (!ayId) return
    setLoading(true)
    Promise.all([
      financeApi.summary({ academic_year_id: ayId }),
      financeApi.debtors({ academic_year_id: ayId }),
      financeApi.invoices({}),
    ]).then(([s, d, i]) => {
      setSummary(s || {})
      setDebtors(Array.isArray(d) ? d : [])
      setInvoices(Array.isArray(i) ? i : [])
    }).finally(() => setLoading(false))
  }, [ayId])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Finance</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select value={ayId} onChange={e => setAyId(e.target.value)}>
          {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card"><div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total invoiced</div><div style={{ fontWeight: 700 }}>${summary.total_invoiced ?? 0}</div></div>
            <div className="card"><div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total paid</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>${summary.total_paid ?? 0}</div></div>
            <div className="card"><div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Outstanding</div><div style={{ fontWeight: 700, color: 'var(--secondary-dark)' }}>${summary.outstanding ?? 0}</div></div>
          </div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Debtors</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Total invoiced</th><th>Paid</th><th>Balance</th></tr></thead>
                <tbody>
                  {debtors.map(r => <tr key={r.student_id}><td>{r.first_name} {r.last_name}</td><td>${r.total_invoiced}</td><td>${r.total_paid}</td><td>${r.balance}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Recent invoices</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Amount</th><th>Status</th><th>Due</th></tr></thead>
                <tbody>
                  {invoices.slice(0, 20).map(i => <tr key={i.id}><td>{i.first_name} {i.last_name}</td><td>${i.amount}</td><td><span className={`badge badge-${i.status === 'PAID' ? 'success' : i.status === 'PARTIAL' ? 'warning' : 'info'}`}>{i.status}</span></td><td>{i.due_date || '-'}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
