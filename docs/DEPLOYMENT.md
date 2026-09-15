# Deployment Runbook — AWS Photobooth

How the booth runs in production, how to (re)deploy it, and the event-day
checklist. Keep this next to you on event day.

## Architecture

```
Guest phone (any network)
   │ scan QR (https://<railway>/s/<id>)
   ▼
Railway backend (FastAPI) ── Storage photobooth/* + survey_responses rows
   ▲  /api  (CORS-locked to the Vercel origin)
   │
Vercel frontend (React SPA, HTTPS)
Kiosk browser ── full flow: / → /ready → /capture → /video → /preview → QR → /thank-you
```

- Frontend: `frontend/`, branch `production`, built with `npm run build`
  (`frontend/vercel.json` handles output + SPA rewrites).
- Backend: `backend/`, branch `production`, started with
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (`backend/Procfile`).
- Photos/clips in **Supabase Storage** bucket `photobooth` (public). Answers in
  `public.survey_responses` (see `supabase/migrations/*_create_survey_responses.sql`).
  Backend compresses photo (Pillow JPEG q78, max 1600px → ~150-300KB) and caps clips
  at frontend (960px / 24fps / 1Mbps → ~0.7MB per 6s) so ~200 guests ≈ 200MB.
  No local disk - Railway is stateless. `uploads/` removed.

## One-time setup

### 1. Supabase (storage + DB) - CLI required

```powershell
npx supabase link --project-ref <PROJECT_REF>   # from https://supabase.com/dashboard/project/<ref>
npx supabase db push                            # pushes supabase/migrations/*_create_survey_responses.sql
```

This creates table `survey_responses` (year, knows_sbg, interested, had_fun, will_follow, will_recommend, consent, photo_path, video_path) and bucket `photobooth` (public). Verify: Dashboard -> Table Editor -> `survey_responses` exists, Storage -> `photobooth` exists.

Then Settings -> API -> copy `SUPABASE_URL` + `service_role` key (never `anon`, never commit).

### 2. Railway (backend)

1. New project -> Deploy from GitHub repo -> branch `production`.
2. Set the service **Root Directory** to `backend/`.
3. **Variables** tab - set all of these (required, no fallback):
   | Variable | Value |
   |---|---|
   | `PUBLIC_BASE_URL` | `https://<your-railway-public-domain>` (no trailing slash) |
   | `FRONTEND_URL` | `https://<your-vercel-domain>` |
   | `SUPABASE_URL` | `https://<your-project>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Supabase |
   | `SUPABASE_BUCKET` | `photobooth` |
   | `PORT` | provided automatically by Railway |
4. Deploy. Verify: `https://<railway>/api/health` -> `{"status":"ok"}`.
   Walk one session -> bucket gains `<id>.jpg` + `<id>.webm` (if clip) and `survey_responses` gets one row (`video_path IS NOT NULL` == has video).

### 3. Vercel (frontend)

1. Import the same repo -> branch `production`.
2. **Root Directory:** `frontend`. (Build/output come from `vercel.json`.)
3. **Environment variable:**
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://<railway-domain>/api` |
4. Deploy. Open the URL - the Start screen should load over HTTPS
   (HTTPS is required for the kiosk camera to work at all).

### 4. Link check

1. Walk one full session on the Vercel URL (allow the camera).
2. At the QR page, scan with your phone on **mobile data** (not Wi-Fi -
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

Both platforms redeploy automatically. Data is durable in Supabase - redeploys don't lose it.

## Event-day checklist (5 minutes, do this first)

- [ ] Backend `/api/health` returns ok.
- [ ] Frontend loads over HTTPS; camera permission granted on kiosk.
- [ ] One full test session -> scan QR on mobile data -> photo + clip download.
- [ ] Supabase row appears in Table Editor (`survey_responses`).
- [ ] Kiosk: disable sleep/hibernate, charger plugged in, browser fullscreen (F11).

## Collecting photos

All sessions are durable in Supabase. Pull anyway for backup/offline:

```powershell
cd C:\Users\Miggy\Documents\Photobooth\AWS-Photobooth
py tools/pull-photos.py --server https://<railway-domain> --out ./event-photos
```

Safe to re-run (skips what's already downloaded). Each session saves as
`<id>.jpg` + `<id>.webm` (when a clip exists). Survey CSV: Supabase Dashboard -> Table Editor -> `survey_responses` -> Export.

## Troubleshooting

| Symptom | Likely cause -> fix |
|---|---|
| Phone QR won't load | Backend asleep (free tier - tap again, wait ~30s) or wrong `PUBLIC_BASE_URL`. Check the URL in the QR matches the Railway domain. |
| Frontend shows "Upload failed" or 503 | Supabase not configured or quota hit. Check Railway Variables `SUPABASE_URL/SERVICE_ROLE_KEY` and Railway logs `Supabase not configured` / `storage upload failed` / `database insert failed`. Also CORS: `FRONTEND_URL` must exactly match Vercel URL. Oversize video (>8MB) also 413s here. |
| Share page 404 | Row deleted or storage object deleted. Check `survey_responses` row + `photobooth/` object exist. |
| Camera never goes live on kiosk | Page must be HTTPS (Vercel) or `localhost`; check the site camera permission. Denied cameras still complete the flow (placeholder art). |
| Countdown never starts | It waits for the camera; see above. |
| `/ready`, `/capture` 404 on refresh | `vercel.json` rewrites missing - confirm Root Directory is `frontend/`. |

## Rollback

Both platforms keep prior deployments: Railway -> Deployments -> Redeploy;
Vercel -> Deployments -> Promote to Production. Supabase data is durable across rollbacks.
