import { useEffect, useState } from 'react'
import { attendanceApi, classesApi } from '../../services/api'

export default function TeacherAttendance() {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [list, setList] = useState([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classesApi.list().then(setClasses).then(() => { if (classes.length) setClassId(classes[0]?.id) })
  }, [])

  useEffect(() => {
    if (!classId) return
    setLoading(true)
    attendanceApi.list({ class_id: classId, from_date: date, to_date: date }).then(setList).finally(() => setLoading(false))
  }, [classId, date])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Attendance</h1>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select value={classId} onChange={e => setClassId(e.target.value)}>
          <option value="">Select class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {list.map(a => <tr key={a.id}><td>{a.first_name} {a.last_name}</td><td>{a.date}</td><td><span className={`badge badge-${a.status === 'PRESENT' ? 'success' : a.status === 'ABSENT' ? 'danger' : 'warning'}`}>{a.status}</span></td></tr>)}
            </tbody>
          </table>
          {list.length === 0 && <p style={{ padding: '1rem' }}>No attendance for this date. Use bulk mark from your class list.</p>}
        </div>
      )}
    </div>
  )
}
