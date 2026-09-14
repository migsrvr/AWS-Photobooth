# AWS-Photobooth

Event photobooth app: React kiosk UI (capture flow) + FastAPI backend (photo/print/email handling).

> **Status (as of Sep 2026):** Frontend is a working UI prototype. Backend is a stub — only `GET /api/health` exists. The photo/print/email endpoints the frontend calls are **not implemented yet**, so the full capture flow will fail past the UI.

## Prereqs (Windows + PowerShell)

- Python 3.11+ (tested on 3.14.7). Use the `py` launcher.
- Node.js 18+ (tested on v24.19.0) + npm (tested on 11.17.0).
- Two PowerShell terminals (one for backend, one for frontend).

Check yours:

```powershell
py --version
node --version
npm --version
```

## Quickstart

### 1. Backend (Terminal 1)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload --port 8000
```

Verify: open `http://localhost:8000/api/health` — expect `{"status":"ok"}`.
Interactive docs: `http://localhost:8000/docs`.

> Note: `requirements.txt` includes `pywin32`, so install/run is Windows-only.

### 2. Frontend (Terminal 2)

```powershell
cd frontend
npm install   # skip if node_modules already exists
npm run dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api/*` to `http://localhost:8000` (see `frontend/vite.config.js`), so the backend **must** be running or API calls fail with `ECONNREFUSED`.

### URLs

| What | URL |
|---|---|
| App | `http://localhost:5173` |
| Backend health | `http://localhost:8000/api/health` |
| Backend Swagger docs | `http://localhost:8000/docs` |

### Production build (frontend only)

```powershell
cd frontend
npm run build   # outputs to frontend/dist/
npm run preview # serves the build locally
```

## How it fits together

```text
Browser (:5173)  -- /api/* -->  Vite proxy  -->  FastAPI (:8000)
  React Router pages            axios baseURL='/api'
  Idle -> Capture -> Preview -> ThankYou
```

- Frontend entry: `frontend/src/main.jsx` renders `src/App.jsx` (router).
- All API calls go through `frontend/src/services/api.js` with `baseURL: '/api'`.
- Backend entry: `backend/app/main.py` creates the FastAPI app.

## Frontend tour

| Route | File | Purpose |
|---|---|---|
| `/` | `src/pages/IdlePage.jsx` | Attract/idle screen (Start Screen design) |
| `/ready` | `src/pages/InitialCapturePage.jsx` | Pose preview with live webcam, leads into capture |
| `/capture` | `src/pages/CapturePage.jsx` | Single 5-4-3-2-1 countdown, captures photo + records countdown clip |
| `/video` | `src/pages/VideoPreviewPage.jsx` | Looping playback of the recorded countdown clip, Proceed carries photo onward |
| `/preview` | `src/pages/PreviewPage.jsx` | Review strip, print/email |
| `/thank-you` | `src/pages/ThankYouPage.jsx` | Confirmation, auto-reset |

Supporting code: `src/components/` (CameraFeed, CountdownOverlay, PhotoGrid, ActionBar, EmailModal, ShotTracker, AutoResetTimer), `src/hooks/useCountdown.js`.

## Backend tour

| Path | State |
|---|---|
| `backend/app/main.py` | Only `GET /api/health` |
| `backend/app/routes/`, `models/`, `services/`, `utils/` | Empty stubs (`__init__.py` only) |
| `backend/captures/`, `backend/strips/` | Output folders for raw captures / composed strips (currently unused) |

## API status

| Frontend call (`src/services/api.js`) | Endpoint | Status |
|---|---|---|
| `healthCheck()` | `GET /api/health` | Works |
| `uploadSession()` | `POST /api/photos/upload` | Works (multipart photo + answers JSON → `{session_id, download_url}`) |
| — (phone scans QR) | `GET /api/photos/:sessionId/download` | Works (serves the JPEG) |
| `uploadPhotos()` | `POST /api/photos/upload` | Legacy stub caller, unused by current flow |
| `getPhotos()` | `GET /api/photos/:sessionId` | Not implemented (404) |
| `triggerPrint()` | `POST /api/print/:sessionId` | Not implemented (404) |
| `sendEmail()` | `POST /api/email/send` | Not implemented (404) — survey + QR replaced the email flow |

## Assets (Figma → webp)

UI images live in `frontend/src/assets/` (`.webp` + step/icon `.svg`), imported
directly in JSX so Vite bundles + hashes them. Source: Figma file
`AWS-Photobooth-UI (Copy)`; raster roles were verified against each frame's
render code, and unreferenced duplicate fills were skipped (see
`tools/figma-assets.json`).

- Hero/first-paint image (`start-bg`) loads **eager** with `fetchpriority="high"`;
  everything else uses `loading="lazy" decoding="async"`.
- `mascot-loading`, `mascot-choose`, `mascot-choose-alt`, and the step SVGs are
  shipped but not yet wired — they're for the future Choose-Frame screen
  (no such route exists yet).
- To re-import: re-download raws via the Figma MCP `download_assets` tool,
  match filenames/`sha10` in `tools/figma-assets.json`, then run:

```powershell
py tools/import-figma-assets.py --src-dir <dir-with-downloaded-raws>
```

### QR download flow

`/preview` → QR Code → 5-question survey (all answers + consent required) →
photo + answers upload to `backend/uploads/` → QR page (`SCAN TO DOWNLOAD`
with session code + Download) → Close → `/thank-you`.

Phones scan the QR, so the URL must be LAN-reachable: the backend uses
`PUBLIC_BASE_URL` when set, otherwise auto-detects the machine's LAN IP
(`http://<lan-ip>:8000`). Set it explicitly at events if the network differs:

```powershell
$env:PUBLIC_BASE_URL = "http://192.168.1.36:8000"
py -m uvicorn app.main:app --reload --port 8000
```

Frontend QR rendering is client-side (`qrcode.react`, no network needed).

## Project structure

```text
AWS-Photobooth/
  backend/
    app/
      main.py          # FastAPI app + /api/health
      routes/ models/ services/ utils/  # empty stubs
    requirements.txt
    captures/ strips/  # photo output folders
  frontend/
    src/
      pages/           # Idle, Capture, Preview, ThankYou
      components/      # camera, countdown, grid, modals
      hooks/ services/ # useCountdown, api.js (axios)
    vite.config.js     # dev port 5173 + /api proxy
    package.json       # dev / build / preview scripts
  README.md
```

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Python was not found` when running `python` | On this machine use `py`, not `python` |
| `pywin32` install fails | Must be on Windows with matching Python version; can't run backend on macOS/Linux as-is |
| Frontend shows `ECONNREFUSED /api/...` | Backend isn't running — start Terminal 1 first |
| `http://localhost:5173` blank | Run from `frontend/` folder with `npm run dev`, check terminal for errors |
| Camera shows "unavailable" on `/ready` | Grant the browser camera permission. Kiosk deployments must be served from `localhost` or HTTPS — browsers block `getUserMedia` on plain `http://<lan-ip>` |
| Port `8000`/`5173` already in use | Kill the other process or pass `--port <n>` (backend) — but then update the Vite proxy target |
| API returns 404 for `/photos`, `/print`, `/email` | Expected — those routes don't exist yet (see API status) |
| `.venv` won't activate | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then retry |

## Next TODOs

1. Implement `POST /api/photos/upload` + `GET /api/photos/:sessionId` (save to `captures/`).
2. Implement strip composition into `strips/` (Pillow is already a dependency).
3. Implement `POST /api/print/:sessionId` (Windows printing via `pywin32`) and `POST /api/email/send`.
4. Add `backend/.env.example` (`python-dotenv` is already a dependency but no `.env` is documented).
5. Add a backend start script so you don't need the full `uvicorn` command.
