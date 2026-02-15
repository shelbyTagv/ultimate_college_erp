import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { resultsApi } from '../../services/api'

export default function StudentResults() {
  const { user } = useAuth()
  const studentId = user?.student_id
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    resultsApi.byStudent(studentId).then(setList).finally(() => setLoading(false))
  }, [studentId])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My results</h1>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Exam</th><th>Type</th><th>Marks</th><th>Total</th><th>Term</th></tr></thead>
            <tbody>
              {list.map(r => <tr key={r.id}><td>{r.subject_name}</td><td>{r.exam_name}</td><td>{r.exam_type}</td><td>{r.marks}</td><td>{r.total_marks}</td><td>{r.term_name}</td></tr>)}
            </tbody>
          </table>
          {list.length === 0 && <p style={{ padding: '1rem' }}>No results yet.</p>}
        </div>
      )}
    </div>
  )
}
