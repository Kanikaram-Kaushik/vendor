# DesignBHK Admin Portal

Admin dashboard for managing users (admins & designers), brands (vendors), quotes, and audit logs.

## Tech Stack
- **Next.js 14** (App Router) + TypeScript
- **Prisma v7** + `@prisma/adapter-pg` (PostgreSQL driver)
- **Neon PostgreSQL** (cloud database, free tier)
- **JWT** authentication via `jose`
- **bcryptjs** for password hashing

---

## Local Development

### 1. Set up Neon Database
1. Go to [neon.tech](https://neon.tech) → Create free account → New Project
2. Copy the **Connection String** (looks like `postgresql://user:pass@host/db?sslmode=require`)

### 2. Configure environment
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and paste your Neon DATABASE_URL
```

### 3. Push schema to database
```bash
npm run db:push
```

### 4. Seed with sample data
Start the dev server first, then visit:
```
http://localhost:3000/api/seed
```
Or use the **Configuration → Re-seed** button in the UI.

### 5. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default admin credentials:**
- Email: `admin@designbhk.com`
- Password: `admin123`

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the `designbhk-admin` repo

### 3. Add Environment Variables in Vercel
In the Vercel project settings → Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | A random 32+ char string |

### 4. Deploy
Vercel will automatically run `prisma generate && next build`.

### 5. Seed the deployed database
After first deploy, visit:
```
https://your-app.vercel.app/api/seed
```

---

## Pages

| Page | Description |
|------|-------------|
| `/login` | Admin login |
| `/admin/overview` | Real-time dashboard (polls every 5s) |
| `/admin/users` | Manage Admins & Designers only |
| `/admin/brands` | Manage Vendors/Brands only |
| `/admin/quotes` | Manage quotes with status filters |
| `/admin/configuration` | App settings + re-seed |
| `/admin/audit-logs` | Full action history |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/overview` | Dashboard stats |
| GET/POST | `/api/users` | List/create users |
| PATCH/DELETE | `/api/users/[id]` | Edit/delete user |
| GET/POST | `/api/brands` | List/create brands |
| PATCH/DELETE | `/api/brands/[id]` | Edit/delete brand |
| GET/POST | `/api/quotes` | List/create quotes |
| PATCH/DELETE | `/api/quotes/[id]` | Edit/delete quote |
| GET | `/api/audit-logs` | Audit history |
| POST | `/api/seed` | Seed database |
