"""Postgres table `survey_responses` via Supabase PostgREST (httpx).

No ORM. Reuses SUPABASE_URL + SERVICE_ROLE_KEY (bypasses RLS).
`video_path IS NOT NULL` == has_video (no bool column).
"""
import os

import httpx
from loguru import logger


def _cfg() -> tuple[str, str]:
    url = (os.environ.get("SUPABASE_URL") or "").strip().rstrip("/")
    key = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not url or not key:
        raise RuntimeError(
            "Supabase not configured: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
        )
    if "://" not in url:
        url = "https://" + url
    return url, key


def _headers(key: str) -> dict:
    return {"apikey": key, "Authorization": f"Bearer {key}"}


ANSWERS_TO_COLS = {
    "q1": "year",
    "q2": "knows_sbg",
    "q3": "interested",
    "q4": "had_fun",
    "q5": "will_follow",
    "q6": "will_recommend",
}


def insert_survey(
    session_id: str,
    created_at: str,
    answers: dict,
    photo_path: str,
    video_path: str | None,
) -> bool:
    url, key = _cfg()
    row = {
        "session_id": session_id,
        "created_at": created_at,
        "photo_path": photo_path,
        "video_path": video_path,
        "consent": bool(answers.get("consent", False)),
    }
    for q, col in ANSWERS_TO_COLS.items():
        row[col] = answers.get(q)
    endpoint = f"{url}/rest/v1/survey_responses"
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.post(
                endpoint,
                json=row,
                headers={**_headers(key), "Content-Type": "application/json", "Prefer": "return=minimal"},
            )
        if r.status_code in (200, 201, 204):
            return True
        logger.warning(f"insert_survey {session_id} -> {r.status_code}: {r.text[:300]}")
        return False
    except Exception as e:
        logger.warning(f"insert_survey {session_id} failed ({e})")
        return False


def get_survey(session_id: str) -> dict | None:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/survey_responses"
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(
                endpoint,
                params={"session_id": f"eq.{session_id}", "select": "*"},
                headers=_headers(key),
            )
        if r.status_code != 200:
            logger.warning(f"get_survey {session_id} -> {r.status_code}")
            return None
        data = r.json()
        if isinstance(data, list) and data:
            return data[0]
        return None
    except Exception as e:
        logger.warning(f"get_survey {session_id} failed ({e})")
        return None


def list_surveys(limit: int = 1000) -> list[dict]:
    url, key = _cfg()
    endpoint = f"{url}/rest/v1/survey_responses"
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(
                endpoint,
                params={"select": "*", "order": "created_at.asc", "limit": str(limit)},
                headers=_headers(key),
            )
        if r.status_code != 200:
            logger.warning(f"list_surveys -> {r.status_code}: {r.text[:200]}")
            return []
        data = r.json()
        return data if isinstance(data, list) else []
    except Exception as e:
        logger.warning(f"list_surveys failed ({e})")
        return []
