from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .auth.routes import router as auth_router
from .users.routes import router as users_router
from .students.routes import router as students_router
from .teachers.routes import router as teachers_router
from .parents.routes import router as parents_router
from .classes.routes import router as classes_router
from .subjects.routes import router as subjects_router
from .attendance.routes import router as attendance_router
from .assignments.routes import router as assignments_router
from .exams.routes import router as exams_router
from .results.routes import router as results_router
from .finance.routes import router as finance_router
from .messages.routes import router as messages_router
from .reports.routes import router as reports_router
from .uploads.routes import router as uploads_router
from .applications.routes import router as applications_router
from .learning.routes import router as learning_router

settings = get_settings()

app = FastAPI(
    title="Ultimate College of Technology ERP API",
    description="High School Management ERP – ZIMSEC aligned",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(students_router, prefix=API_PREFIX)
app.include_router(teachers_router, prefix=API_PREFIX)
app.include_router(parents_router, prefix=API_PREFIX)
app.include_router(classes_router, prefix=API_PREFIX)
app.include_router(subjects_router, prefix=API_PREFIX)
app.include_router(attendance_router, prefix=API_PREFIX)
app.include_router(assignments_router, prefix=API_PREFIX)
app.include_router(exams_router, prefix=API_PREFIX)
app.include_router(results_router, prefix=API_PREFIX)
app.include_router(finance_router, prefix=API_PREFIX)
app.include_router(messages_router, prefix=API_PREFIX)
app.include_router(reports_router, prefix=API_PREFIX)
app.include_router(uploads_router, prefix=API_PREFIX)
app.include_router(applications_router, prefix=API_PREFIX)
app.include_router(learning_router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {"name": "Ultimate College of Technology ERP API", "docs": "/docs"}


@app.get("/api/public/settings")
def public_settings():
    from .db import get_cursor, fetch_one
    with get_cursor() as cur:
        cur.execute("SELECT key, value FROM institution_settings")
        rows = cur.fetchall()
        return {r["key"]: r["value"] for r in rows}


@app.get("/api/public/news")
def public_news():
    from .db import get_cursor
    with get_cursor() as cur:
        cur.execute("SELECT id, title, content, event_date, created_at FROM news_events WHERE is_published = true ORDER BY event_date DESC LIMIT 20")
        rows = cur.fetchall()
        return [dict(r, id=str(r["id"])) for r in rows]


@app.get("/api/public/forms")
def public_forms():
    from .db import get_cursor
    with get_cursor() as cur:
        cur.execute("SELECT id, name, display_order FROM forms ORDER BY display_order")
        return [dict(r, id=str(r["id"])) for r in cur.fetchall()]


@app.get("/api/public/streams")
def public_streams(form_id: str = None):
    from .db import get_cursor
    with get_cursor() as cur:
        if form_id:
            cur.execute("SELECT id, name, form_id FROM streams WHERE form_id = %s ORDER BY name", (form_id,))
        else:
            cur.execute("SELECT id, name, form_id FROM streams ORDER BY form_id, name")
        return [dict(r, id=str(r["id"]), form_id=str(r["form_id"])) for r in cur.fetchall()]


@app.get("/api/public/forms")
def public_forms():
    from .db import get_cursor
    with get_cursor() as cur:
        cur.execute("SELECT id, name, display_order FROM forms ORDER BY display_order")
        return [dict(r, id=str(r["id"])) for r in cur.fetchall()]


@app.get("/api/public/streams")
def public_streams(form_id: str = None):
    from .db import get_cursor
    with get_cursor() as cur:
        if form_id:
            cur.execute("SELECT id, name, form_id FROM streams WHERE form_id = %s ORDER BY name", (form_id,))
        else:
            cur.execute("SELECT id, name, form_id FROM streams ORDER BY form_id, name")
        return [dict(r, id=str(r["id"]), form_id=str(r["form_id"])) for r in cur.fetchall()]


# Seed default users (run once after DB schema + seed.sql)
@app.post("/api/seed/users")
def seed_users():
    from .db import get_cursor, fetch_one
    from .auth import hash_password
    defaults = [
        ("superadmin@ultimatecollege.co.zw", "Admin@123", "SUPER_ADMIN"),
        ("admin@ultimatecollege.co.zw", "Admin@123", "ADMIN_STAFF"),
        ("teacher@ultimatecollege.co.zw", "Teacher@123", "TEACHER"),
        ("student@ultimatecollege.co.zw", "Student@123", "STUDENT"),
        ("parent@ultimatecollege.co.zw", "Parent@123", "PARENT"),
        ("finance@ultimatecollege.co.zw", "Finance@123", "FINANCE_OFFICER"),
    ]
    with get_cursor() as cur:
        for email, password, role in defaults:
            cur.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
            if cur.fetchone():
                continue
            ph = hash_password(password)
            cur.execute("INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s) RETURNING id", (email, ph, role))
            row = cur.fetchone()
            uid = str(row["id"])
            if role == "TEACHER":
                cur.execute("SELECT id FROM teachers WHERE user_id = %s", (uid,))
                if not cur.fetchone():
                    cur.execute("INSERT INTO teachers (user_id, first_name, last_name, employee_number) VALUES (%s, 'Default', 'Teacher', 'T001')", (uid,))
            elif role == "STUDENT":
                cur.execute("SELECT id FROM students WHERE user_id = %s", (uid,))
                if not cur.fetchone():
                    cur.execute("INSERT INTO students (user_id, first_name, last_name, gender) VALUES (%s, 'Default', 'Student', 'Other') RETURNING id", (uid,))
                    sid = cur.fetchone()
                    if sid:
                        ay = fetch_one(cur, "SELECT id FROM academic_years WHERE is_current = true LIMIT 1")
                        cl = fetch_one(cur, "SELECT id FROM classes LIMIT 1")
                        if ay and cl:
                            cur.execute("INSERT INTO student_classes (student_id, class_id, academic_year_id) VALUES (%s, %s, %s)",
                                        (sid["id"], cl["id"], ay["id"]))
            elif role == "PARENT":
                cur.execute("SELECT id FROM parents WHERE user_id = %s", (uid,))
                if not cur.fetchone():
                    cur.execute("INSERT INTO parents (user_id, first_name, last_name) VALUES (%s, 'Default', 'Parent')", (uid,))
    return {"ok": True, "message": "Default users created or already exist"}
