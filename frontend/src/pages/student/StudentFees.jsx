import { useEffect, useState } from 'react'
import { financeApi } from '../../services/api'

export default function StudentFees() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    financeApi.invoices().then(setInvoices).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Fees</h1>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Academic year</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.map(i => <tr key={i.id}><td>{i.academic_year_name}</td><td>${i.amount}</td><td>{i.due_date || '-'}</td><td><span className={`badge badge-${i.status === 'PAID' ? 'success' : i.status === 'PARTIAL' ? 'warning' : 'info'}`}>{i.status}</span></td></tr>)}
            </tbody>
          </table>
          {invoices.length === 0 && <p style={{ padding: '1rem' }}>No invoices.</p>}
        </div>
      )}
    </div>
  )
}
