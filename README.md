# Ultimate College of Technology – ERP & Website

Integrated High School Management ERP & Public Website for **Ultimate College of Technology** (Form 1–Form 6), Harare, Zimbabwe. ZIMSEC-aligned examination management.

**Stack:** React PWA · Python (FastAPI) · PostgreSQL · Single Monorepo

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- npm or yarn

### 1. Clone & install

```bash
cd ultimate-college-erp
```

### 2. Database

```bash
# Create database
createdb ultimate_college_erp

# Run schema
psql -d ultimate_college_erp -f database/schema.sql

# Seed data
psql -d ultimate_college_erp -f database/seed.sql
```

### 3. Backend (Python)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit .env with DB URL and JWT secret
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### 4. Seed default users (one-time)

After the backend is running, create default login accounts:

```bash
curl -X POST http://localhost:8000/api/seed/users
```

### 5. Frontend (React PWA)

```bash
cd frontend
npm install
npm run build
npm run preview   # or: npm run dev
```

App: http://localhost:5173

### 6. Production

- Backend: `uvicorn src.main:app --host 0.0.0.0 --port 8000`
- Frontend: serve `frontend/dist` (e.g. nginx) or `npm run preview`
- Set `VITE_API_BASE_URL` to your API URL in production

### 7. Search engine optimization (SEO)

- **Meta & titles:** Each public page sets its own `<title>`, meta description, and Open Graph / Twitter tags via the `SEO` component.
- **Structured data:** Home page includes JSON-LD `EducationalOrganization` schema for rich results.
- **Sitemap:** `frontend/public/sitemap.xml` lists public URLs. Replace `https://ultimatecollege.co.zw` with your live domain when deploying.
- **robots.txt:** `frontend/public/robots.txt` allows indexing of public pages and disallows dashboard routes (`/admin`, `/login`, etc.).

---

## Monorepo Structure

```
ultimate-college-erp/
├── frontend/          # React PWA
├── backend/           # Python FastAPI
├── database/          # schema.sql, seed.sql
├── README.md
└── .env.example
```

---

## Default Login (Seed)

| Role        | Email                  | Password  |
|------------|------------------------|-----------|
| Super Admin| superadmin@ultimatecollege.co.zw | Admin@123 |
| Admin      | admin@ultimatecollege.co.zw      | Admin@123 |
| Teacher    | teacher@ultimatecollege.co.zw    | Teacher@123 |
| Student    | student@ultimatecollege.co.zw    | Student@123 |
| Parent     | parent@ultimatecollege.co.zw     | Parent@123 |
| Finance    | finance@ultimatecollege.co.zw    | Finance@123 |

**Change these in production.**

---

## Roles & Access

- **SUPER_ADMIN** – Full system, role management, audit
- **ADMIN_STAFF** – Applications, classes, assignments, reports, messaging
- **TEACHER** – Assigned classes, materials, assignments, grades, attendance, results
- **STUDENT** – Profile, e-learning, assignments, results, fees, library
- **PARENT** – Linked students, performance, fees, messaging
- **FINANCE_OFFICER** – Fees, invoices, payments, arrears, reports

---

## License

Proprietary – Ultimate College of Technology.
