"""Time helpers for consistent UTC timestamps across the backend."""
from datetime import UTC, datetime


def utc_now() -> datetime:
    """Return current UTC time as a naive datetime for DB compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)
