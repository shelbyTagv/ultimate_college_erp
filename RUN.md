# How to Run – Ultimate College ERP

Follow these steps in order. All commands assume you are in the project root **`ultimate-college-erp`** unless stated otherwise.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.11+
- **PostgreSQL** 15+ (server running, `psql` and `createdb` available)

---

## Step 1: Go to the project folder

```bash
cd /home/shelby/Desktop/My_Projects/High_Schoo_Erp_System/ultimate-college-erp
```

*(Or your actual path to `ultimate-college-erp`.)*

---

## Step 2: Create the database and load schema + seed

Create the database:

```bash
createdb ultimate_college_erp
```

If your PostgreSQL user is not `postgres` or uses a password, you may need:

```bash
psql -U your_username -h localhost -c "CREATE DATABASE ultimate_college_erp;"
```

Apply schema and seed (run from project root):

```bash
psql -d ultimate_college_erp -f database/schema.sql
psql -d ultimate_college_erp -f database/seed.sql
```

If you use a different user/host:

```bash
psql -U your_username -h localhost -d ultimate_college_erp -f database/schema.sql
psql -U your_username -h localhost -d ultimate_college_erp -f database/seed.sql
```

---

## Step 3: Backend – virtual environment and dependencies

```bash
cd backend
python3 -m venv venv
```

Activate the virtual environment:

- **Linux / macOS:**
  ```bash
  source venv/bin/activate
  ```
- **Windows (Command Prompt):**
  ```cmd
  venv\Scripts\activate.bat
  ```
- **Windows (PowerShell):**
  ```powershell
  venv\Scripts\Activate.ps1
  ```

Install Python packages:

```bash
pip install -r requirements.txt
```

---

## Step 4: Backend – environment file

Create `.env` from the example (still inside `backend/`):

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- **`DATABASE_URL`** – your PostgreSQL connection string, for example:
  - `postgresql://postgres:postgres@localhost:5432/ultimate_college_erp`
  - Or: `postgresql://USER:PASSWORD@HOST:5432/ultimate_college_erp`
- **`JWT_SECRET`** – a long random string (change in production).

Example `.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ultimate_college_erp
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Step 5: Start the backend server

From the **`backend/`** directory, with the venv activated:

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

- API: **http://localhost:8000**
- Docs: **http://localhost:8000/docs**

Leave this terminal running.

---

## Step 6: Seed default users (one-time)

In a **new terminal**, run (backend must be running):

```bash
curl -X POST http://localhost:8000/api/seed/users
```

You should see something like: `{"ok":true,"message":"Default users created or already exist"}`.

---

## Step 7: Frontend – install and run

Open another terminal. From the **project root** `ultimate-college-erp`:

```bash
cd frontend
npm install
```

Then either:

**Development (with hot reload):**

```bash
npm run dev
```

**Or build and preview:**

```bash
npm run build
npm run preview
```

- App: **http://localhost:5173**

---

## Step 8: Log in

Open **http://localhost:5173** in a browser and use any of these (after Step 6):

| Role       | Email                             | Password    |
|-----------|------------------------------------|-------------|
| Super Admin | superadmin@ultimatecollege.co.zw | Admin@123   |
| Admin     | admin@ultimatecollege.co.zw       | Admin@123   |
| Teacher   | teacher@ultimatecollege.co.zw     | Teacher@123 |
| Student   | student@ultimatecollege.co.zw     | Student@123 |
| Parent    | parent@ultimatecollege.co.zw       | Parent@123  |
| Finance   | finance@ultimatecollege.co.zw     | Finance@123 |

---

## Quick reference – all commands in order

```bash
# 1. Project root
cd /home/shelby/Desktop/My_Projects/High_Schoo_Erp_System/ultimate-college-erp

# 2. Database
createdb ultimate_college_erp
psql -d ultimate_college_erp -f database/schema.sql
psql -d ultimate_college_erp -f database/seed.sql

# 3. Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET

# 4. Start backend (keep running)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# 5. In a NEW terminal – seed users (one-time)
curl -X POST http://localhost:8000/api/seed/users

# 6. Frontend (another terminal, from project root)
cd /home/shelby/Desktop/My_Projects/High_Schoo_Erp_System/ultimate-college-erp/frontend
npm install
npm run dev
```

Then open **http://localhost:5173** and log in with one of the emails above.

---

## Troubleshooting

- **`createdb: command not found`**  
  Use PostgreSQL’s `psql` to create the DB, or add the PostgreSQL `bin` directory to your PATH.

- **`Connection refused` / database errors**  
  Ensure PostgreSQL is running and `DATABASE_URL` in `backend/.env` is correct (user, password, host, port, database name).

- **Frontend can’t reach API**  
  In development, Vite proxies `/api` to `http://localhost:8000`. Ensure the backend is running on port 8000.

- **Port 8000 or 5173 already in use**  
  Stop the process using that port, or change the port (e.g. `uvicorn ... --port 8001` or `npm run dev -- --port 5174`).
