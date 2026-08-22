# 📌 JobUz — Eslab qolish kerak bo'lgan narsalar

## Loyiha haqida
- **JobUz** — O'zbekiston ish qidirish platformasi (full stack)
- Joylashuvi: `~/Desktop/ish/jobuz`
- **GitHub linki hozircha YO'Q** — repo hali GitHub'ga push qilinmagan.
  Link olish uchun:
  ```bash
  cd ~/Desktop/ish/jobuz
  git init && git add . && git commit -m "first commit"
  # GitHub'da yangi repo ochib:
  git remote add origin https://github.com/<username>/jobuz.git
  git push -u origin main
  ```

## Texnologiyalar
| Qism | Stack |
|------|-------|
| Frontend | Next.js 14 (SSR), Tailwind CSS, Zustand, jsPDF |
| Backend | Node.js + Express, Prisma ORM |
| Baza | PostgreSQL |
| Auth | JWT + bcrypt (+ Telegram Login Widget) |

## Muhim buyruqlar
```bash
# Baza (docker)
docker run -d --name jobuz-pg \
  -e POSTGRES_USER=jobuz -e POSTGRES_PASSWORD=jobuz -e POSTGRES_DB=jobuz \
  -p 5432:5432 postgres:16-alpine

# Backend
cd backend && npm install && npx prisma migrate dev && node src/server.js   # :5000

# Frontend
cd frontend && npm install && npm run dev    # :3000
```

## Env fayllar (unutmaslik kerak!)
- `backend/.env` — `.env.example` dan nusxa olinadi:
  - `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`
  - Telegram (ixtiyoriy): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`
- `frontend/.env.local` — `.env.example` dan nusxa olinadi:
  - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`

## Deploy (Render.com)
- `render.yaml` Blueprint orqali avtomatik deploy
- Dashboardda to'ldirish kerak: `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`,
  `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`
- ⚠️ Render bepul tarifda **15 daqiqa uxlaydi** → cron-job.org orqali
  har 10 daqiqada `/health` ga ping yuborish kerak

## Telegram bot sozlash
1. @BotFather → `/newbot` → token
2. Kanal ochib, botni admin qilish (post huquqi bilan)
3. Login Widget uchun @BotFather → Bot Settings → Domain'ga sayt domeni kiritish
4. Webhook: `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<backend>/api/telegram/webhook"`

## Asosiy API
```
POST /api/auth/register | login        GET /api/auth/me
GET  /api/jobs?...                     POST/PUT/DELETE /api/jobs/:id
GET  /api/companies | /:id             POST/PUT /api/companies (logo multipart)
POST /api/cv                           PUT/DELETE /api/cv/:id
POST /api/applications                 PUT /api/applications/:id/status
POST /api/telegram/webhook | login | subscribe
```

## Prisma modellari
User, Company, Job, CV, Application, SavedFilter — `backend/prisma/schema.prisma`

## Qisqa tuzilma
```
backend/src/  → config/db.js, controllers/, middleware/, routes/, telegram/
frontend/app/ → page.jsx (SSR bosh sahifa), jobs/, companies/, cv-builder/, login/, dashboard/
frontend/lib/ → api, store, pdf, constants
```
