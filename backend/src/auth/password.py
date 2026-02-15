import bcrypt

# bcrypt has a 72-byte max; we truncate to avoid errors (normal passwords are shorter)
MAX_BCRYPT_BYTES = 72


def hash_password(plain: str) -> str:
    p = plain.encode("utf-8")
    if len(p) > MAX_BCRYPT_BYTES:
        p = p[:MAX_BCRYPT_BYTES]
    return bcrypt.hashpw(p, bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    p = plain.encode("utf-8")
    if len(p) > MAX_BCRYPT_BYTES:
        p = p[:MAX_BCRYPT_BYTES]
    try:
        return bcrypt.checkpw(p, hashed.encode("utf-8"))
    except Exception:
        return False
