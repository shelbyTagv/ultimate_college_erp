import { useEffect, useState } from 'react'
import { examsApi, resultsApi, classesApi } from '../../services/api'

export default function TeacherResults() {
  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classesApi.list().then(setClasses)
  }, [])

  useEffect(() => {
    setLoading(true)
    examsApi.list(classId ? { class_id: classId } : {}).then(setExams).finally(() => setLoading(false))
  }, [classId])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Results</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select value={classId} onChange={e => setClassId(e.target.value)}>
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Exam</th><th>Class</th><th>Subject</th><th>Type</th></tr></thead>
            <tbody>
              {exams.map(e => <tr key={e.id}><td>{e.name}</td><td>{e.class_name}</td><td>{e.subject_name}</td><td>{e.exam_type}</td></tr>)}
            </tbody>
          </table>
          {exams.length === 0 && <p style={{ padding: '1rem' }}>No exams yet.</p>}
        </div>
      )}
    </div>
  )
}
