# Resume Builder

Build a resume through a step-by-step questionnaire, pick a template, and download it as a PDF.

- **Guided questionnaire:** biography, contacts, summary, work experience, education, skills, achievements, languages, hobbies, references, and a profile photo
- **Three PDF templates:** Classic, Modern, Editorial
- **Accounts:** sign up and log in; each user manages their own resumes

## Stack

Three TypeScript services plus MongoDB, all run with Docker Compose:

| Service | Tech | Port |
|---|---|---|
| `frontend/` | Next.js 15 (App Router), React 19, Tailwind v4 | 3050 |
| `backend/` | NestJS REST API, Mongoose, JWT auth | 4000 |
| `pdf-generator/` | NestJS + Puppeteer (Chromium) | 4001 |
| `mongo` | MongoDB 7 | internal only |

## Quick start

Requires Docker with Compose.

```bash
cp .env.example .env    # then change the secrets
docker compose up --build
```

Open http://localhost:3050.

The frontend is on 3050 rather than 3000 because 3000–3003 were taken on the original dev machine. To change it, edit the `frontend.ports` mapping in `docker-compose.yml` and `CORS_ORIGIN` in `.env`.

### Dev mode (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Only `src/` and config files are mounted into the containers, so rebuild after changing dependencies.

### Useful commands

```bash
docker compose logs -f     # follow logs
docker compose down        # stop
docker compose down -v     # stop and delete all data (DB, photos, PDFs)
```

## Configuration

All settings live in `.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `MONGO_INITDB_ROOT_USERNAME` / `MONGO_INITDB_ROOT_PASSWORD` / `MONGO_DB` | MongoDB credentials and database name |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Signing secrets for access and refresh tokens |
| `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL` | Token lifetimes (default `15m` / `7d`) |
| `PDF_WEBHOOK_SECRET` | Shared secret the PDF generator uses when calling back to the API |
| `CORS_ORIGIN` | Frontend origin allowed by the API (comma-separated for several) |
| `NEXT_PUBLIC_API_URL` | API URL as seen from the browser (baked in at frontend build time) |

Change every `change-me-*` value before deploying anywhere.

## Architecture

```
┌──────────┐  REST   ┌──────────┐ HTTP+webhook ┌────────────────┐
│ frontend │ ──────▶ │ backend  │ ───────────▶ │ pdf-generator  │
│ (Next.js)│         │ (NestJS) │ ◀─────────── │ (Puppeteer)    │
└──────────┘         └────┬─────┘              └────────────────┘
                          │
                       MongoDB
```

- **Auth:** short-lived access token sent as a Bearer header; refresh token in an httpOnly cookie, rotated on each refresh.
- **Photos:** uploaded to the API (JPEG/PNG/WebP, up to 5 MB) and stored on the `uploads` Docker volume.
- **PDFs:** generated asynchronously and stored on the `pdfs` volume in the PDF generator, then streamed back through the API.

PDF flow:
1. Frontend calls `POST /resumes/:id/generate-pdf`
2. Backend sends the resume to the PDF generator (`POST /jobs`) with a callback URL
3. PDF generator returns 202, renders the PDF, then calls back `POST /internal/pdf-webhook`
4. Frontend polls `GET /resumes/:id` until `pdfStatus === 'ready'`, then downloads `GET /resumes/:id/pdf`

## API overview

| Method & path | Description |
|---|---|
| `POST /auth/signup`, `POST /auth/login` | Create account / log in |
| `POST /auth/refresh`, `POST /auth/logout` | Rotate tokens / log out |
| `GET /resumes`, `POST /resumes` | List / create resumes |
| `GET /resumes/:id`, `PATCH /resumes/:id`, `DELETE /resumes/:id` | Read / update / delete a resume |
| `POST /resumes/:id/photo` | Upload profile photo (multipart field `photo`) |
| `POST /resumes/:id/generate-pdf` | Start PDF generation |
| `GET /resumes/:id/pdf` | Download the generated PDF |
| `GET /health` | Health check (API and PDF generator) |

All `/resumes` routes require authentication.

## Adding a PDF template

1. Add a renderer `(resume) => html` in `pdf-generator/src/jobs/templates/` and register it in `templates/index.ts`.
2. Add an entry with the same key to `frontend/src/lib/templates.ts` so it appears in the template picker.
