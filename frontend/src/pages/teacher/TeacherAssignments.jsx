import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { assignmentsApi, classesApi, subjectsApi } from '../../services/api'

export default function TeacherAssignments() {
  const [list, setList] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [classId, setClassId] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ class_id: '', subject_id: '', title: '', description: '', total_marks: 100 })

  useEffect(() => {
    classesApi.list().then(setClasses)
    subjectsApi.list().then(setSubjects)
  }, [])

  useEffect(() => {
    setLoading(true)
    assignmentsApi.list(classId ? { class_id: classId } : {}).then(setList).finally(() => setLoading(false))
  }, [classId])

  const handleCreate = (e) => {
    e.preventDefault()
    setCreating(true)
    assignmentsApi.create(form).then(() => { setForm({ class_id: '', subject_id: '', title: '', description: '', total_marks: 100 }); assignmentsApi.list().then(setList) }).finally(() => setCreating(false))
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Assignments</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select value={classId} onChange={e => setClassId(e.target.value)}>
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Create assignment</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxWidth: 560 }}>
          <div className="form-group">
            <label>Class</label>
            <select required value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
              <option value="">Select</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select required value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
              <option value="">Select</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Title</label>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Total marks</label>
            <input type="number" value={form.total_marks} onChange={e => setForm({ ...form, total_marks: e.target.value })} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating}>Create</button>
        </form>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Class</th><th>Subject</th><th>Marks</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map(a => <tr key={a.id}><td>{a.title}</td><td>{a.class_name}</td><td>{a.subject_name}</td><td>{a.total_marks}</td><td><Link to={`#submissions-${a.id}`}>Submissions</Link></td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
