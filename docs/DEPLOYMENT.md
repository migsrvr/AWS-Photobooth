# Deployment Runbook — AWS Photobooth

How the booth runs in production, how to (re)deploy it, and the event-day
checklist. Keep this next to you on event day.

## Architecture

```
Guest phone (any network)
   │ scan QR (https://<railway>/s/<id>)
   ▼
Railway backend (FastAPI) ── serves share page, photo JPEG, clip webm
   ▲  /api  (CORS-locked to the Vercel origin)
   │
Vercel frontend (React SPA, HTTPS)
Kiosk browser ── full flow: / → /ready → /capture → /video → /preview → QR → /thank-you
```

- Frontend: `frontend/`, branch `production`, built with `npm run build`
  (`frontend/vercel.json` handles output + SPA rewrites).
- Backend: `backend/`, branch `production`, started with
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (`backend/Procfile`).
- Photos/clips live on the backend's local disk (`uploads/` at repo root).
  Railway's disk is **ephemeral** — restarts wipe it. This is accepted;
  collection is covered below.

## One-time setup

### 1. Railway (backend)

1. New project → Deploy from GitHub repo → branch `production`.
2. Set the service **Root Directory** to `backend/`.
3. **Variables** tab — set all three:
   | Variable | Value |
   |---|---|
   | `PUBLIC_BASE_URL` | `https://<your-railway-public-domain>` (no trailing slash) |
   | `FRONTEND_URL` | `https://<your-vercel-domain>` |
   | `PORT` | provided automatically by Railway |
4. Deploy. Verify: `https://<railway>/api/health` → `{"status":"ok"}`.

### 2. Vercel (frontend)

1. Import the same repo → branch `production`.
2. **Root Directory:** `frontend`. (Build/output come from `vercel.json`.)
3. **Environment variable:**
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://<railway-domain>/api` |
4. Deploy. Open the URL — the Start screen should load over HTTPS
   (HTTPS is required for the kiosk camera to work at all).

### 3. Link check

1. Walk one full session on the Vercel URL (allow the camera).
2. At the QR page, scan with your phone on **mobile data** (not Wi-Fi —
   this proves the public path, not your LAN).
3. Share page must show: photo, playable clip, Save photo, Save video,
   session code. Tap each Save button once.

## Updating (redeploying)

Railway tracks **`master`** and Vercel tracks **`production`**.
Land changes on `production` first, then merge to `master`:

```powershell
git checkout production
# ... commit work ...
git push origin production
git checkout master
git merge --ff-only production
git push origin master
```

Both platforms redeploy automatically.
**Freeze code once doors open:** every redeploy wipes Railway's disk,
including that morning's photos. Pull photos first (below), then push.

## Event-day checklist (5 minutes, do this first)

- [ ] Backend `/api/health` returns ok.
- [ ] Frontend loads over HTTPS; camera permission granted on kiosk.
- [ ] One full test session → scan QR on mobile data → photo + clip download.
- [ ] `uploads/` collection plan confirmed (laptop + `pull-photos.py` ready).
- [ ] Kiosk: disable sleep/hibernate, charger plugged in, browser fullscreen (F11).

## Collecting photos (the whiteboard rule)

Railway forgets everything on restart. Pull early, pull often:

```powershell
cd C:\Users\Miggy\Documents\Photobooth\AWS-Photobooth
py tools/pull-photos.py --server https://<railway-domain> --out ./event-photos
```

Safe to re-run (skips what's already downloaded). Each session saves as
`<id>.jpg` + `<id>.webm` (when a clip exists) + `<id>.json` (survey answers).
Optional auto-pull every 15 min via Task Scheduler — see README.

## Troubleshooting

| Symptom | Likely cause → fix |
|---|---|
| Phone QR won't load | Backend asleep (free tier — tap again, wait ~30s) or wrong `PUBLIC_BASE_URL`. Check the URL in the QR matches the Railway domain. |
| Frontend shows "Upload failed" | Backend down/restarting, or CORS: `FRONTEND_URL` must exactly match the Vercel URL (no trailing slash). |
| Camera never goes live on kiosk | Page must be HTTPS (Vercel) or `localhost`; check the site camera permission. Denied cameras still complete the flow (placeholder art). |
| Countdown never starts | It waits for the camera; see above. |
| Photos gone after redeploy | Expected (ephemeral disk). Pull before every push once doors open. |
| `/ready`, `/capture` 404 on refresh | `vercel.json` rewrites missing — confirm Root Directory is `frontend/`. |

## Rollback

Both platforms keep prior deployments: Railway → Deployments → Redeploy;
Vercel → Deployments → Promote to Production. No data to migrate
(photos are files, already pulled or already gone).
