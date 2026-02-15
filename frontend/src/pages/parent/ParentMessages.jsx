import { useEffect, useState } from 'react'
import { messagesApi } from '../../services/api'

export default function ParentMessages() {
  const [list, setList] = useState([])
  const [folder, setFolder] = useState('inbox')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    messagesApi.list(folder).then(setList).catch(() => []).finally(() => setLoading(false))
  }, [folder])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Messages</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button type="button" className={folder === 'inbox' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setFolder('inbox')}>Inbox</button>
        <button type="button" className={folder === 'sent' ? 'btn btn-primary' : 'btn btn-outline'} style={{ marginLeft: 8 }} onClick={() => setFolder('sent')}>Sent</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="card">
          {list.length === 0 ? <p>No messages.</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>From / To</th><th>Subject</th><th>Date</th></tr></thead>
                <tbody>
                  {list.map(m => <tr key={m.id}><td>{m.sender_email || m.recipient_email}</td><td>{m.subject || '(no subject)'}</td><td>{m.created_at?.slice(0, 16)}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
