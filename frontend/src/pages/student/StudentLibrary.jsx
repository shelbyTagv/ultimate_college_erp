import { useEffect, useState } from 'react'
import { learningApi } from '../../services/api'

export default function StudentLibrary() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    learningApi.library().then(setList).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Digital library</h1>
      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {list.map(item => (
            <div key={item.id} className="card">
              <h3 style={{ margin: '0 0 0.5rem' }}>{item.title}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.description || item.category || 'Resource'}</p>
              {item.file_name && <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>File: {item.file_name}</p>}
            </div>
          ))}
          {list.length === 0 && <p>No library items.</p>}
        </div>
      )}
    </div>
  )
}
