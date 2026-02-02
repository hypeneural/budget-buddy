# Budget Buddy Monorepo

This repo now contains both backend (Laravel 12) and frontend (React + Vite) in one place.

## Structure

- apps/api     Laravel 12 API
- apps/web     React + Vite frontend
- packages/shared     Shared TS types/contracts
- packages/api-client Placeholder for a generated OpenAPI client

Frontend details live in apps/web/README.md.

## Quick start

Backend (Laravel):
- cd apps/api
- composer install
- cp .env.example .env
- php artisan key:generate
- php artisan serve

Frontend (React/Vite):
- cd apps/web
- npm install
- npm run dev

## Build frontend into Laravel

The Vite build outputs to apps/api/public/app:

- npm --workspace apps/web run build

Then open:
- http://localhost:8000/app

## API base

A sample endpoint is available at:
- GET /api/v1/health -> { "status": "ok" }

## Notes

- Vite base is /app in production. React Router uses BASE_URL for routing.
- Vite dev server proxies /api to http://127.0.0.1:8000.
- If you change the SPA mount path, update:
  - apps/web/vite.config.ts
  - apps/api/routes/web.php
