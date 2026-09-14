"""Google Drive storage for event photos.

Activated when both GOOGLE_SERVICE_ACCOUNT_JSON and GDRIVE_FOLDER_ID are set.
Files are shared anyone-with-link so organizers can browse them in Drive;
phones download through our own /download endpoint (no Google auth needed).
"""
import io
import json
import os

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

SCOPES = ["https://www.googleapis.com/auth/drive"]
MIME = {"jpg": "image/jpeg", "png": "image/png", "webp": "image/webp"}


def is_configured() -> bool:
    return bool(os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
                and os.environ.get("GDRIVE_FOLDER_ID"))


def _service():
    info = json.loads(os.environ["GOOGLE_SERVICE_ACCOUNT_JSON"])
    creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def folder_id() -> str:
    return os.environ["GDRIVE_FOLDER_ID"]


def upload_file(local_path: str, name: str, mime_type: str) -> str:
    """Uploads a local file into the event folder. Returns the Drive file id."""
    service = _service()
    media = MediaFileUpload(local_path, mimetype=mime_type, resumable=False)
    created = service.files().create(
        body={"name": name, "parents": [folder_id()]},
        media_body=media,
        fields="id",
    ).execute()
    file_id = created["id"]
    service.permissions().create(
        fileId=file_id, body={"type": "anyone", "role": "reader"}
    ).execute()
    return file_id


def download_bytes(file_id: str) -> tuple[bytes, str]:
    """Returns (content, mime_type) for a Drive file id."""
    service = _service()
    meta = service.files().get(fileId=file_id, fields="mimeType").execute()
    buf = io.BytesIO()
    downloader = MediaIoBaseDownload(buf, service.files().get_media(fileId=file_id))
    done = False
    while not done:
        _, done = downloader.next_chunk()
    return buf.getvalue(), meta.get("mimeType", "application/octet-stream")
