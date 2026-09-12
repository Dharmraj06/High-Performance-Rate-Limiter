# Rate Limiter Website Deployment

The website has two independently deployable applications:

- `frontend/`: React application built by Vite.
- `backend/`: FastAPI service that serves benchmark JSON data.

The benchmark files in `backend/data/` are part of the backend deployment. The
service resolves them relative to its source directory, so it does not depend on
an absolute developer-machine path.

## Environment variables

| Application | Variable | Required in production | Purpose |
| --- | --- | --- | --- |
| Frontend | `VITE_API_URL` | Yes | Public base URL of the deployed backend, for example `https://api.example.com`. Vite embeds this value during the build. |
| Backend | `FRONTEND_URL` | Yes | Allowed deployed frontend origin, for example `https://app.example.com`. Multiple comma-separated origins are supported. |
| Backend | `PORT` | Host-provided | Port on which Uvicorn listens. Defaults to `8000` only when running `python main.py`. |

Do not add a trailing slash to `VITE_API_URL` or `FRONTEND_URL`; the application
normalizes one if present. The committed `.env.example` files document the
expected values. Do not commit real `.env` files.

## Local development

Start the backend in one terminal:

```bash
cd website/backend
./venv/bin/uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```bash
cd website/frontend
npm install
npm run dev
```

With `VITE_API_URL` unset, the frontend uses its Vite development-only `/api`
proxy to `http://127.0.0.1:8000`. The proxy is configured under Vite's `server`
setting and is not included in the production build. The local frontend is at
`http://localhost:5173`.

## Frontend production build and test

Set the deployed backend URL before building:

```bash
cd website/frontend
VITE_API_URL=https://api.example.com npm run build
npm run preview
```

The static production artifact is `frontend/dist/`. Deploy that directory to a
static host. Configure the host to rewrite unknown application routes to
`/index.html`; this preserves direct navigation and refresh for both `/` and
`/benchmarks`.

`frontend/vercel.json` provides this rewrite for Vercel. For another static
host, configure the equivalent SPA fallback in that host's dashboard or config.

## Backend production startup

Install the backend dependencies and run Uvicorn with the host-provided port:

```bash
cd website/backend
./venv/bin/pip install -r requirements.txt
export FRONTEND_URL=https://app.example.com
export PORT=8000
./venv/bin/uvicorn main:app --host 0.0.0.0 --port "$PORT"
```

On a platform that supplies `PORT`, use its value directly:

```bash
uvicorn main:app --host 0.0.0.0 --port "$PORT"
```

The API endpoints are unchanged:

- `GET /api/health`
- `GET /api/benchmark/baseline`
- `GET /api/benchmark/final`
- `GET /api/benchmark/comparison`

## Vercel frontend deployment

1. Import the repository and set Vercel's **Root Directory** to `website/frontend`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Add `VITE_API_URL` in Vercel environment variables with the public Render
   backend URL. Redeploy after changing it, because Vite embeds it during build.
4. Keep the included `vercel.json`; it makes `/benchmarks` refreshes serve the
   SPA entry point.

## Render backend deployment

1. Create a Render **Web Service** with **Root Directory** `website/backend`.
2. Set the build command to `pip install -r requirements.txt`.
3. Set the start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Set `FRONTEND_URL` to the exact Vercel production origin. Add a comma and a
   second origin only when preview or custom domains also need browser API access.
5. Ensure `data/baseline.json` and `data/final.json` remain in the deployed
   backend source tree.

After Render provides its public URL, set that URL as `VITE_API_URL` on Vercel
and redeploy the frontend.
