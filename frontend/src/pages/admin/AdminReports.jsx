import { useEffect, useState } from 'react'
import { reportsApi, classesApi } from '../../services/api'

export default function AdminReports() {
  const [enrollment, setEnrollment] = useState([])
  const [gender, setGender] = useState([])
  const [zimsec, setZimsec] = useState([])
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
      reportsApi.enrollment({ academic_year_id: ayId }),
      reportsApi.genderDistribution({ academic_year_id: ayId }),
      reportsApi.zimsecCandidates({ academic_year_id: ayId }),
    ]).then(([e, g, z]) => {
      setEnrollment(Array.isArray(e) ? e : [])
      setGender(Array.isArray(g) ? g : [])
      setZimsec(Array.isArray(z) ? z : [])
    }).finally(() => setLoading(false))
  }, [ayId])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Reports</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select value={ayId} onChange={e => setAyId(e.target.value)}>
          {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Enrollment by class</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Class</th><th>Form</th><th>Stream</th><th>Count</th></tr></thead>
                <tbody>
                  {enrollment.map(r => <tr key={r.class_name}><td>{r.class_name}</td><td>{r.form_name}</td><td>{r.stream_name}</td><td>{r.student_count}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>Gender distribution</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Gender</th><th>Count</th></tr></thead>
                <tbody>
                  {gender.map(r => <tr key={r.gender || 'null'}><td>{r.gender || 'Not set'}</td><td>{r.count}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Form 4 & Form 6 (ZIMSEC candidates)</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Class</th><th>Form</th></tr></thead>
                <tbody>
                  {zimsec.map(s => <tr key={s.id}><td>{s.first_name} {s.last_name}</td><td>{s.class_name}</td><td>{s.form_name}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
