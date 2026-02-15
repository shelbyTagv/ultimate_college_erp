import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { assignmentsApi } from '../../services/api'

export default function StudentAssignments() {
  const { user } = useAuth()
  const studentId = user?.student_id
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    assignmentsApi.list({ student_id: studentId }).then(setList).finally(() => setLoading(false))
  }, [studentId])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>My assignments</h1>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Due date</th><th>Total marks</th><th>My marks</th><th>Submitted</th></tr></thead>
            <tbody>
              {list.map(a => <tr key={a.id}><td>{a.title}</td><td>{a.subject_name}</td><td>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '-'}</td><td>{a.total_marks}</td><td>{a.marks != null ? a.marks : '-'}</td><td>{a.submitted_at ? 'Yes' : 'No'}</td></tr>)}
            </tbody>
          </table>
          {list.length === 0 && <p style={{ padding: '1rem' }}>No assignments.</p>}
        </div>
      )}
    </div>
  )
}
