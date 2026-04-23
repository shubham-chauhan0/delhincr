# 🚀 NCR Realty — Complete Deployment Guide
## Go from zero to live in under 3 hours

---

## STEP 1 — Install Prerequisites (10 min)

### Install Node.js
Download from: https://nodejs.org → Choose "LTS" version → Install

### Install Git
Download from: https://git-scm.com → Install

### Verify installation
Open Terminal / Command Prompt and run:
```
node --version      # Should show v18 or above
npm --version       # Should show 9 or above
git --version       # Should show git version 2.x
```

---

## STEP 2 — Set Up Supabase Database (20 min)

1. Go to https://supabase.com → Click "Start your project" → Sign up (free)
2. Click "New Project"
   - Name: `ncr-realty`
   - Database Password: choose a strong password (SAVE THIS)
   - Region: `Southeast Asia (Singapore)` ← closest to India
3. Wait ~2 minutes for project to provision
4. Go to **SQL Editor** (left sidebar)
5. Click "New Query"
6. Copy the ENTIRE contents of `schema.sql` and paste it
7. Click "Run" (green button)
   - You should see: "Success. No rows returned"
8. Go to **Table Editor** → you should see `pins`, `votes`, `flags` tables
9. Go to **Settings → API** and copy:
   - `Project URL` → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → paste as `SUPABASE_SERVICE_ROLE_KEY`

---

## STEP 3 — Set Up the Project Locally (15 min)

```bash
# 1. Navigate to where you want the project
cd ~/Desktop

# 2. Copy this project folder here (or initialize fresh)
# If you have the files already, just cd into the folder:
cd ncr-realty

# 3. Install dependencies
npm install

# 4. Create your environment file
cp .env.example .env.local

# 5. Edit .env.local and fill in your Supabase credentials
# On Mac: open -e .env.local
# On Windows: notepad .env.local
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
#   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
#   NEXT_PUBLIC_APP_URL=http://localhost:3000   (for now)

# 6. Run locally
npm run dev

# 7. Open browser: http://localhost:3000
# You should see the NCR Realty app with seed data!
```

---

## STEP 4 — Push to GitHub (10 min)

1. Go to https://github.com → Sign up / Log in
2. Click "+" → "New repository"
   - Name: `ncr-realty`
   - Visibility: **Private** (important — keeps your keys safe)
   - Click "Create repository"
3. Run these commands in your project folder:

```bash
git init
git add .
git commit -m "Initial commit — NCR Realty"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ncr-realty.git
git push -u origin main
```

---

## STEP 5 — Deploy to Vercel (10 min)

1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project"
3. Import your `ncr-realty` GitHub repository
4. Vercel auto-detects Next.js — don't change any settings
5. Before clicking Deploy, click **"Environment Variables"** and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL        = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY       = eyJhbGci...
   NEXT_PUBLIC_APP_URL             = https://ncr-realty.vercel.app
   ```
6. Click **Deploy**
7. Wait ~2 minutes → Your site is live at `https://ncr-realty.vercel.app` 🎉

---

## STEP 6 — Custom Domain (30 min, optional but recommended)

### Buy a domain
- Go to https://namecheap.com or https://godaddy.com
- Suggested names (check availability):
  - `ncrrealty.in`       — ₹800/year
  - `delhirent.in`       — ₹800/year
  - `ncrrentdata.in`     — ₹800/year
  - `ncrpricecheck.in`   — ₹800/year

### Connect to Vercel
1. In Vercel → your project → **Settings → Domains**
2. Click "Add Domain" → enter your domain e.g. `ncrrealty.in`
3. Vercel shows you DNS records to add
4. Go to your domain registrar (Namecheap/GoDaddy)
5. Add the DNS records Vercel shows (usually an A record and CNAME)
6. Wait 10–30 minutes for DNS to propagate
7. Update your `.env.local` and Vercel env variable:
   `NEXT_PUBLIC_APP_URL=https://ncrrealty.in`
8. Redeploy: go to Vercel → Deployments → click "..." → "Redeploy"

---

## STEP 7 — Google Analytics (15 min, optional)

1. Go to https://analytics.google.com
2. Create account → Create property → Choose "Web"
3. Enter your domain → Get your **Measurement ID** (looks like `G-XXXXXXXXXX`)
4. Add to Vercel environment variables:
   `NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX`
5. Redeploy

---

## STEP 8 — Submit to Google Search Console (10 min)

This gets your site indexed on Google.

1. Go to https://search.google.com/search-console
2. Add property → Enter your domain
3. Verify ownership (Vercel makes this easy — add TXT record to DNS)
4. Once verified, click "Sitemaps" → Submit `https://yourdomain.in/sitemap.xml`
5. Click "URL Inspection" → enter your homepage URL → "Request Indexing"

---

## STEP 9 — Future Deploys

Every time you make changes:
```bash
git add .
git commit -m "describe your change"
git push
```
Vercel automatically rebuilds and deploys in ~60 seconds.

---

## 💰 Cost Summary

| Service       | Free Tier Limit          | Paid Plan       |
|---------------|--------------------------|-----------------|
| Vercel        | Unlimited (hobby)        | $20/mo (Pro)    |
| Supabase      | 500MB DB, 2GB bandwidth  | $25/mo (Pro)    |
| Domain        | —                        | ~₹800/year      |
| Google Analytics | Unlimited              | Free forever    |

**Total cost to launch: ₹0** (free tiers cover you for first 50K monthly visitors)

---

## 🆘 Common Issues

**"Module not found" error**
→ Run `npm install` again

**Supabase "permission denied" error**
→ Check that you ran the FULL schema.sql in Supabase SQL Editor
→ Check that your SUPABASE_SERVICE_ROLE_KEY is correct in env vars

**Site shows blank page on Vercel**
→ Check Vercel build logs for errors
→ Usually means an env variable is missing

**Rate limit hits immediately**
→ The in-memory rate limiter resets on Vercel cold starts — this is fine for production

**Domain not working after 30 min**
→ DNS can take up to 48h globally but usually works within 1h
→ Check your DNS records match exactly what Vercel specified
