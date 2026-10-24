# Deployment

## Vercel

Import the repository as a single Vercel project from its root. The root
[`vercel.json`](./vercel.json) defines the `backend` and `frontend` services and
their public routes. Keep the Vercel project root at the repository root;
service roots and the frontend build output are configured in that file.

The project requires Node.js 20.19 or newer. The backend service runs the
Express application from `backend/index.js`; the frontend service runs
`npm run build` in `frontend` and serves `frontend/dist`. The frontend service
rewrites client-side routes to `index.html` so direct navigation to React
Router pages works.

Add these environment variables to the Vercel project for Production, Preview,
and Development as appropriate:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign and verify authentication tokens |
| `CLOUDINARY_CLOUD_NAME` | Yes for image uploads | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Yes for image uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes for image uploads | Cloudinary API secret |
| `REDIS_URL` | Yes on Vercel | Redis connection URL shared by Socket.IO instances |
| `FRONTEND_URLS` | Only for cross-origin frontends | Comma-separated allowed frontend origins |
| `COOKIE_SAME_SITE` | Only when changing cookie policy | `lax` for the same-origin Vercel setup; use `none` with HTTPS for cross-site cookies |
| `VITE_API_URL` | No | Override the browser API origin; defaults to the current Vercel origin |
| `VITE_SOCKET_URL` | No | Override the browser Socket.IO origin; defaults to `VITE_API_URL` or the current Vercel origin |

Vite variables are embedded into the browser bundle at build time. Never put
secrets in `VITE_*` variables. For the default same-origin setup, leave both
`VITE_API_URL` and `VITE_SOCKET_URL` unset. Use the example files as templates:
[`backend/.env.example`](./backend/.env.example) and
[`frontend/.env.example`](./frontend/.env.example).

Provision a Redis-compatible service (for example, a Vercel Marketplace Redis
integration) and set its TLS connection URL as `REDIS_URL` in each environment.
The backend fails during startup on Vercel if this variable is missing. Redis
is needed because Vercel can run requests and WebSocket connections on
different function instances; the Socket.IO Redis adapter distributes events
between those instances.

Vercel Functions support WebSockets. This project exports its HTTP server for
the Socket.IO endpoint and the browser client uses WebSocket transport only.
Connections can close when a function reaches its maximum duration, so clients
must reconnect; Socket.IO reconnects and re-authenticates using the token
cookie. The Redis adapter provides cross-instance event delivery, but the
actual Vercel deployment and its configured Redis provider must still be
verified after environment variables are added.

## Local development

Copy `backend/.env.example` to `backend/.env` and fill in local credentials.
Start the backend with `npm run dev` in `backend`, then start the frontend with
`npm run dev` in `frontend`. Vite proxies `/api` and `/socket.io` to the local
backend. Without `REDIS_URL`, local Socket.IO uses its single-process in-memory
adapter; configure local Redis to test cross-process behavior.
