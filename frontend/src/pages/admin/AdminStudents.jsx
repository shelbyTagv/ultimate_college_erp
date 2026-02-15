import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { studentsApi, classesApi } from '../../services/api'

export default function AdminStudents() {
  const [searchParams] = useSearchParams()
  const classId = searchParams.get('class_id')
  const [list, setList] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classesApi.list().then(setClasses)
  }, [])

  useEffect(() => {
    setLoading(true)
    studentsApi.list({ class_id: classId || undefined }).then(setList).finally(() => setLoading(false))
  }, [classId])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Students</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select value={classId || ''} onChange={e => window.location.href = e.target.value ? `/admin/students?class_id=${e.target.value}` : '/admin/students'}>
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Class</th><th>Gender</th><th>Status</th></tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td>{s.first_name} {s.last_name}</td>
                  <td>{s.class_name || '-'}</td>
                  <td>{s.gender || '-'}</td>
                  <td><span className="badge badge-info">{s.enrollment_status || 'ACTIVE'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p style={{ padding: '1rem' }}>No students.</p>}
        </div>
      )}
    </div>
  )
}
