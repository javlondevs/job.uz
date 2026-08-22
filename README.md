# 🇺🇿 JobUz — O'zbekiston ish qidirish platformasi

Ish beruvchilar va ish qidiruvchilarni bog'laydigan to'liq stack ilova.

## Texnologiyalar

| Qism | Stack |
|------|-------|
| Frontend | Next.js 14 (SSR), Tailwind CSS, Zustand, jsPDF |
| Backend | Node.js + Express, Prisma ORM |
| Baza | PostgreSQL |
| Auth | JWT + bcrypt (+ Telegram Login Widget) |
| Telegram | Bot bildirishnomalar, kanalga avto-post, obuna filtrlari |

## Funktsiyalar

- **Vakansiya qidirish** — kalit so'z, viloyat, soha, maosh oralig'i, ish turi, tajriba, masofaviy toggle; saralash va sahifalash
- **CV Builder** — 3 shablon (Modern / Classic / Minimal), jonli A4 ko'rinish, PDF yuklab olish
- **Kompaniyalar** — profil (logotip yuklash bilan), ochiq vakansiyalar ro'yxati
- **Arizalar** — CV yuborish, ish beruvchi panelida holat boshqaruvi (Ko'rildi / Qabul / Rad)
- **Telegram** — yangi vakansiya obunachilarga + kanalga avtomatik tushadi; Login Widget orqali kirish

## Ishga tushirish (lokal)

### 1. Baza

```bash
docker run -d --name jobuz-pg \
  -e POSTGRES_USER=jobuz -e POSTGRES_PASSWORD=jobuz -e POSTGRES_DB=jobuz \
  -p 5432:5432 postgres:16-alpine
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # DATABASE_URL'ni o'zingiznikiga moslang
npm install
npx prisma migrate deploy   # yoki: npx prisma migrate dev
node src/server.js          # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:3000
```

## Render.com ga deploy

1. Repo'ni GitHub'ga yuklang.
2. Render Dashboard → **Blueprint** → repo'ni ulang (`render.yaml` avtomatik o'qiladi).
3. `sync: false` bo'lgan env'larni to'ldiring:
   - `FRONTEND_URL` — frontend domeni (masalan `https://jobuz-web.onrender.com`)
   - `NEXT_PUBLIC_API_URL` — backend domeni (masalan `https://jobuz-api.onrender.com`)
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` (ixtiyoriy)
4. Deploy tugagach, Telegram webhook o'rnatish:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<backend>/api/telegram/webhook"
```

> ⚠️ Render bepul tarifda 15 daqiqa harakatsizlikdan keyin uxlaydi. cron-job.org orqali har 10 daqiqada `/health` ga ping yuborib uyg'otib turish mumkin.

### Telegram bot sozlash

1. @BotFather → `/newbot` → tokenni oling
2. Kanal yarating, botni admin qilib qo'shing (post qilish huquqi bilan)
3. Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` (@kanal_nomi), frontend'da `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
4. Login Widget ishlashi uchun botning **Domain** sozlamasiga sayt domenini kiriting (@BotFather → /mybots → Bot Settings → Domain)

## API xaritasi

```
POST   /api/auth/register | login          GET /api/auth/me
GET    /api/jobs?q=&location=&sector=&type=&experience=&salaryMin=&salaryMax=&isRemote=&sort=&page=
POST   /api/jobs (employer)                PUT/DELETE /api/jobs/:id
GET    /api/jobs/my (employer)
GET    /api/companies | /api/companies/:id POST/PUT /api/companies (employer, logo multipart)
GET    /api/cv                             POST /api/cv, PUT/DELETE /api/cv/:id
POST   /api/applications                   GET /api/applications/mine
GET    /api/applications/job/:jobId        PUT /api/applications/:id/status
POST   /api/telegram/webhook               POST /api/telegram/login
POST   /api/telegram/subscribe             GET /api/telegram/subscriptions
```

## Tuzilma

```
jobuz/
├── backend/
│   ├── prisma/schema.prisma      # User, Company, Job, CV, Application, SavedFilter
│   └── src/
│       ├── config/db.js          # Prisma client
│       ├── controllers/          # biznes logika
│       ├── middleware/           # auth (JWT), upload (multer)
│       ├── routes/               # marshrutlar
│       ├── telegram/telegram.service.js
│       └── server.js
├── frontend/
│   ├── app/                      # sahifalar (App Router)
│   │   ├── page.jsx              # Bosh sahifa (SSR)
│   │   ├── jobs/[id]/            # Vakansiya detali
│   │   ├── companies/[id]/       # Kompaniya profili
│   │   ├── cv-builder/           # CV Builder + PDF
│   │   ├── login/                # Kirish/Ro'yxatdan o'tish
│   │   └── dashboard/            # Rolga qarab panel
│   ├── components/               # Navbar, JobCard, CvPreview...
│   └── lib/                      # api, store, pdf, constants
└── render.yaml                   # Render Blueprint
```
