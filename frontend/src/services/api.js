let API_BASE = import.meta.env.VITE_API_URL || ''
if (API_BASE.endsWith('/')) {
  API_BASE = API_BASE.slice(0, -1)
}
if (API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.slice(0, -4)
}

function getToken() {
  return localStorage.getItem('token')
}

export async function api(url, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || err.message || 'Request failed')
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return null
  return res.json()
}

export const authApi = {
  login: (email, password) => api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => api('/api/auth/me'),
}

export const publicApi = {
  settings: () => api('/api/public/settings').catch(() => ({})),
  news: () => api('/api/public/news').catch(() => []),
  forms: () => api('/api/public/forms').catch(() => []),
  streams: (formId) => (formId ? api(`/api/public/streams?form_id=${formId}`) : api('/api/public/streams')).catch(() => []),
  submitApplication: (data) => fetch(`${API_BASE}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.ok ? r.json() : r.json().then(e => { throw new Error(e.detail || 'Failed') })),
}

export const usersApi = {
  list: (params) => api(`/api/users?${new URLSearchParams(params)}`),
  create: (data) => api('/api/users', { method: 'POST', body: JSON.stringify(data) }),
}

export const studentsApi = {
  list: (params) => api(`/api/students?${new URLSearchParams(params)}`),
  me: () => api('/api/students/me'),
  get: (id) => api(`/api/students/${id}`),
}

export const teachersApi = {
  list: (params) => api(`/api/teachers?${new URLSearchParams(params)}`),
  me: () => api('/api/teachers/me'),
  get: (id) => api(`/api/teachers/${id}`),
}

export const parentsApi = {
  list: (params) => api(`/api/parents?${new URLSearchParams(params)}`),
  me: () => api('/api/parents/me'),
}

export const classesApi = {
  list: (params) => api(`/api/classes?${new URLSearchParams(params)}`),
  academicYears: () => api('/api/classes/academic-years'),
  forms: () => api('/api/classes/forms'),
  streams: (formId) => api(`/api/classes/streams?form_id=${formId}`),
  terms: (params) => api(`/api/classes/terms?${new URLSearchParams(params || {})}`),
  get: (id) => api(`/api/classes/${id}`),
}

export const subjectsApi = {
  list: () => api('/api/subjects'),
}

export const attendanceApi = {
  list: (params) => api(`/api/attendance?${new URLSearchParams(params)}`),
  byStudent: (studentId, params) => api(`/api/attendance/student/${studentId}?${new URLSearchParams(params)}`),
  mark: (classId, body) => api(`/api/attendance?class_id=${classId}`, { method: 'POST', body: JSON.stringify(body) }),
  bulk: (classId, body) => api(`/api/attendance/bulk?class_id=${classId}`, { method: 'POST', body: JSON.stringify(body) }),
}

export const assignmentsApi = {
  list: (params) => api(`/api/assignments?${new URLSearchParams(params)}`),
  get: (id) => api(`/api/assignments/${id}`),
  create: (body) => api('/api/assignments', { method: 'POST', body: JSON.stringify(body) }),
  submissions: (id) => api(`/api/assignments/${id}/submissions`),
  submit: (id, data) => api(`/api/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data || {}) }),
  grade: (aid, sid, body) => api(`/api/assignments/${aid}/submissions/${sid}/grade`, { method: 'POST', body: JSON.stringify(body) }),
}

export const examsApi = {
  list: (params) => api(`/api/exams?${new URLSearchParams(params)}`),
  create: (body) => api('/api/exams', { method: 'POST', body: JSON.stringify(body) }),
  results: (id) => api(`/api/exams/${id}/results`),
  enterResult: (id, body) => api(`/api/exams/${id}/results`, { method: 'POST', body: JSON.stringify(body) }),
  approveResults: (id) => api(`/api/exams/${id}/results/approve`, { method: 'POST' }),
}

export const resultsApi = {
  byStudent: (studentId, params) => api(`/api/results/student/${studentId}?${new URLSearchParams(params)}`),
  byClass: (classId, params) => api(`/api/results/class/${classId}?${new URLSearchParams(params)}`),
}

export const financeApi = {
  feeStructures: (params) => api(`/api/finance/fee-structures?${new URLSearchParams(params)}`),
  invoices: (params) => api(`/api/finance/invoices?${new URLSearchParams(params)}`),
  getInvoice: (id) => api(`/api/finance/invoices/${id}`),
  createInvoice: (body) => api('/api/finance/invoices', { method: 'POST', body: JSON.stringify(body) }),
  recordPayment: (invoiceId, body) => api(`/api/finance/invoices/${invoiceId}/payments`, { method: 'POST', body: JSON.stringify(body) }),
  debtors: (params) => api(`/api/finance/debtors?${new URLSearchParams(params)}`),
  summary: (params) => api(`/api/finance/summary?${new URLSearchParams(params)}`),
}

export const messagesApi = {
  list: (folder, params) => api(`/api/messages?folder=${folder}&${new URLSearchParams(params)}`),
  send: (body) => api('/api/messages', { method: 'POST', body: JSON.stringify(body) }),
  users: (q) => api(`/api/messages/users?${q ? `q=${encodeURIComponent(q)}` : ''}`),
  get: (id) => api(`/api/messages/${id}`),
}

export const reportsApi = {
  enrollment: (params) => api(`/api/reports/enrollment?${new URLSearchParams(params)}`),
  genderDistribution: (params) => api(`/api/reports/gender-distribution?${new URLSearchParams(params)}`),
  zimsecCandidates: (params) => api(`/api/reports/zimsec-candidates?${new URLSearchParams(params)}`),
}

export const applicationsApi = {
  list: (params) => api(`/api/applications?${new URLSearchParams(params)}`),
  get: (id) => api(`/api/applications/${id}`),
  review: (id, body) => api(`/api/applications/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
  addDocument: (id, data) => api(`/api/applications/${id}/documents?${new URLSearchParams(data)}`, { method: 'POST' }),
}

export const learningApi = {
  materials: (params) => api(`/api/learning/materials?${new URLSearchParams(params)}`),
  createMaterial: (body) => api('/api/learning/materials', { method: 'POST', body: JSON.stringify(body) }),
  library: (params) => api(`/api/learning/library?${new URLSearchParams(params)}`),
}

export const uploadApi = {
  upload: async (file) => {
    const token = getToken()
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/api/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
}
