import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from .config import get_settings

_settings = get_settings()


@contextmanager
def get_cursor(commit=True):
    conn = psycopg2.connect(_settings.database_url)
    conn.autocommit = False
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def fetch_one(cur, query, params=None):
    cur.execute(query, params or ())
    return cur.fetchone()


def fetch_all(cur, query, params=None):
    cur.execute(query, params or ())
    return cur.fetchall()
