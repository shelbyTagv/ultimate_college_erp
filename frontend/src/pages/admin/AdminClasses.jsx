import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { classesApi } from '../../services/api'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classesApi.academicYears().then(y => { setYears(y); if (y.length && !selectedYear) setSelectedYear(y.find(ay => ay.is_current)?.id || y[0].id) })
  }, [])

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    classesApi.list({ academic_year_id: selectedYear }).then(setClasses).finally(() => setLoading(false))
  }, [selectedYear])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Classes</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          {years.map(y => <option key={y.id} value={y.id}>{y.name} {y.is_current ? '(current)' : ''}</option>)}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Class</th><th>Form</th><th>Stream</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.form_name}</td>
                  <td>{c.stream_name}</td>
                  <td><Link to={`/admin/students?class_id=${c.id}`}>Students</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
