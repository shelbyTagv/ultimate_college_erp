import { useEffect, useState } from 'react'
import { teachersApi } from '../../services/api'

export default function AdminTeachers() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    teachersApi.list().then(setList).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Teachers</h1>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email (user)</th><th>Employee #</th><th>Phone</th></tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id}>
                  <td>{t.first_name} {t.last_name}</td>
                  <td>-</td>
                  <td>{t.employee_number || '-'}</td>
                  <td>{t.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p style={{ padding: '1rem' }}>No teachers.</p>}
        </div>
      )}
    </div>
  )
}
