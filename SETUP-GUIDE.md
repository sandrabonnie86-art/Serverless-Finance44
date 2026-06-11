# AlphaVest — Complete Setup Guide

This guide covers deploying AlphaVest on Netlify with a Neon PostgreSQL database.

---

## 1. Prerequisites

- Node.js 20+ and pnpm installed locally
- A [Neon](https://neon.tech) account (free tier works)
- A [Netlify](https://netlify.com) account
- (Optional) Paystack, Flutterwave, and/or Monnify API keys
- (Optional) SMTP email credentials (Gmail App Password recommended)
- (Optional) Google OAuth credentials
- (Optional) Tawk.to account

---

## 2. Environment Variables

Create a `.env` file in `artifacts/api-server/` (never commit this). All variables marked ⭐ are required.

### Core (Required)

| Variable | Description | Example |
|---|---|---|
| ⭐ `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/alphavest?sslmode=require` |
| ⭐ `SESSION_SECRET` | Random string (min 32 chars) for session signing | `openssl rand -hex 32` |
| `NODE_ENV` | Set to `production` on Netlify | `production` |
| `FRONTEND_URL` | Your Netlify domain (comma-separated for multiple) | `https://alphavest.space` |

### App Domain (for Biometric/WebAuthn Login)

| Variable | Description | Example |
|---|---|---|
| `APP_DOMAIN` | Bare domain (no https://) | `alphavest.space` |
| `APP_ORIGIN` | Full origin URL | `https://alphavest.space` |

> ⚠️ **Biometric login will only work if APP_DOMAIN and APP_ORIGIN exactly match your Netlify domain.** If they don't match, fingerprint/face-ID login will fail with "verification failed". Set them from Admin → Settings → Domain & WebAuthn Config after first deploy.

### Payment Gateways (Optional — set in Admin panel or env)

| Variable | Description |
|---|---|
| `PAYSTACK_SECRET_KEY` | Paystack secret key (`sk_live_...` or `sk_test_...`) |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `FLUTTERWAVE_SECRET_KEY` | Flutterwave secret key |
| `MONNIFY_API_KEY` | Monnify API key |
| `MONNIFY_SECRET_KEY` | Monnify secret key |
| `MONNIFY_CONTRACT_CODE` | Monnify contract code |
| `MONNIFY_BASE_URL` | `https://api.monnify.com` (live) |

> Crypto wallet addresses can be set in **Admin → Settings → Crypto Wallet Addresses** instead of env vars.

### Email (Optional — required for withdrawal notifications)

| Variable | Description | Example |
|---|---|---|
| `SMTP_HOST` | SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username/email | `support@alphavest.space` |
| `SMTP_PASS` | SMTP password / App Password | Gmail App Password |
| `SMTP_FROM` | From address in emails | `"AlphaVest" <support@alphavest.space>` |

### Google OAuth (Optional)

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Must match Netlify URL | `https://alphavest.space/api/auth/google/callback` |

---

## 3. Database Setup (Neon)

1. Log into [Neon](https://console.neon.tech) → Create a new project → Copy the connection string.
2. Set `DATABASE_URL` in your `.env` and in Netlify environment variables.
3. Push the schema:
   ```bash
   cd Serverless-Finance
   pnpm --filter @workspace/db run push
   ```
4. Create your first admin user by running the signup, then manually set `is_admin = true` in the Neon SQL editor:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your@email.com';
   ```

---

## 4. Local Development

```bash
cd Serverless-Finance
pnpm install

# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port 3000)
pnpm --filter @workspace/alphavest run dev
```

Access the app at `http://localhost:3000`.

---

## 5. Netlify Deployment

### Method A: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=Serverless-Finance/artifacts/alphavest/dist
```

### Method B: Netlify Dashboard

1. Connect your GitHub repository.
2. Set **Base directory**: `Serverless-Finance`
3. Set **Build command**: `pnpm --filter @workspace/alphavest run build`
4. Set **Publish directory**: `artifacts/alphavest/dist`
5. Add all environment variables from §2 in **Site settings → Environment variables**.

### netlify.toml (already included)

The `netlify.toml` in `Serverless-Finance/` handles:
- Frontend build and publish
- API rewrites: `/_netlify/functions/*` → `/api/*`
- SPA fallback: all routes → `index.html`
- Security headers (CSP, X-Frame-Options, etc.)

---

## 6. First Launch Checklist

After deploy, log in as admin and go to **Admin → Settings**:

- [ ] Set **Support Email** to `support@alphavest.space`
- [ ] Set **App Domain** and **App Origin** (required for fingerprint login)
- [ ] Set **Social Media Links** (LinkedIn, Twitter, Facebook, Instagram)
- [ ] Toggle **Payment Gateways** (enable only those with configured API keys)
- [ ] Toggle **Withdrawal Methods** (enable Bank Transfer, Paystack, and/or Crypto)
- [ ] Set **Tier ROI Rates** (weekly %) for Bronze, Silver, Gold, Platinum, Diamond Ore
- [ ] Set **Tier Minimum Investment** amounts per tier
- [ ] Add **Crypto Wallet Addresses** for each network you accept
- [ ] Set **Early Exit Penalty** (default: 0.05 = 5%)

---

## 7. Tawk.to Live Chat

The Tawk.to widget is already configured with:
- Property ID: `6a2abea9135ef41c3064d7ee`
- Widget ID: `1jqrfhhj9`

It auto-loads on the landing page and all app views. To update, edit `App.tsx`:

```typescript
const TAWK_PROPERTY_ID = "6a2abea9135ef41c3064d7ee";
const TAWK_WIDGET_ID = "1jqrfhhj9";
```

---

## 8. Biometric / WebAuthn Login

WebAuthn fingerprint login requires:
1. **HTTPS** — works automatically on Netlify.
2. **APP_DOMAIN** = bare domain (e.g. `alphavest.space`)
3. **APP_ORIGIN** = full origin (e.g. `https://alphavest.space`)

On localhost, it uses `localhost` as the RP ID automatically.

**Troubleshooting:**
- "Verification failed" → APP_DOMAIN doesn't match your actual domain
- "No credentials found" → User must register fingerprint first in Dashboard → Profile → Security
- Biometric doesn't appear → Browser doesn't support WebAuthn (use Chrome/Safari on mobile)

---

## 9. Investment Tier System

ROI is **daily** — applied once per day over a 30-day term. Users cannot withdraw the investment principal until 30 days are complete, or they pay an early-exit penalty (configurable from admin).

| Tier | Default Min ($) | Default Daily ROI |
|---|---|---|
| Bronze Ore | $3,000 | 0.25% / day |
| Silver Ore | $10,000 | 0.35% / day |
| Gold Ore | $50,000 | 0.45% / day |
| Platinum Ore | $250,000 | 0.55% / day |
| Diamond Ore | $1,000,000 | 0.70% / day |

All tiers, ROI rates, and descriptions are configurable from **Admin → Settings**.
When you change a tier's ROI, all users automatically receive an in-app notification.

---

## 10. Rate Limiting & Security

Built-in protections:
- **Helmet.js** — sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- **Rate limiting** — 200 requests/15min globally, 20 requests/15min on `/api/auth/*`
- **Parameterized queries** — Drizzle ORM prevents SQL injection
- **Session security** — HttpOnly, Secure, SameSite=None cookies on production
- **Body size limit** — 2MB max request body

---

## 11. Cloudflare Protection

Netlify manages your DNS via nameservers — Cloudflare's full proxy (orange cloud) **conflicts** with this setup. Here are the two options:

### Option A: Cloudflare Turnstile CAPTCHA (Recommended — no DNS change)

Turnstile is Cloudflare's free, privacy-preserving CAPTCHA that works without routing traffic through Cloudflare:

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** → **Add Site**
2. Enter your domain, choose "Managed" mode
3. Copy your **Site Key** and **Secret Key**
4. Add to your Netlify environment variables:
   - `TURNSTILE_SITE_KEY` — used in the frontend
   - `TURNSTILE_SECRET_KEY` — used in the API to verify tokens
5. Embed in your signup/login forms with the Turnstile widget script

This protects against bot signups and brute-force attacks without any DNS changes.

### Option B: Full Cloudflare Proxy (WAF + DDoS) — requires DNS migration

If you want Cloudflare's full CDN, WAF (Web Application Firewall), and DDoS mitigation:

1. **Create a Cloudflare account** and add your domain
2. **Change your domain nameservers** (at your registrar, e.g. GoDaddy/Namecheap) to point to Cloudflare's nameservers
3. In Cloudflare DNS, set an **A record** for your domain pointing to `75.2.60.5` (Netlify's load balancer IP) with **proxy enabled** (orange cloud ☁️)
4. In Netlify: Site Settings → Domain Management → confirm the domain still shows as connected
5. Enable Cloudflare features:
   - **WAF** (Web Application Firewall) → turn on OWASP Core Ruleset
   - **Bot Fight Mode** → on
   - **Under Attack Mode** (if actively being attacked) → Security → Settings
   - **Rate Limiting** → create rules for `/api/auth/*` (5 req/min per IP)

> ⚠️ After switching to Cloudflare nameservers, Netlify's automatic SSL certificate renewal still works — Netlify uses Let's Encrypt and Cloudflare will proxy HTTPS correctly.

### Tawk.to Chat Widget Color

The Tawk.to chat bubble color must be changed in their dashboard (the JS API cannot override it):
1. Log in at [tawk.to](https://tawk.to)
2. Go to **Administration → Chat Widget → Appearance**
3. Set the **Theme Color** to `#F2CA50` (brand gold) and the **Text Color** to `#0a0f14` (dark background)
4. Save — the widget bubble will now match the app's gold theme

---

## 12. Why Does the Preview Keep Reloading?

**This only happens in Replit's development environment — not in production.**

The preview pane reloads for two reasons:
1. **Vite HMR (Hot Module Replacement)** — When you or the agent edits a file, Vite's dev server pushes a live update. This is intentional for fast development iteration.
2. **WebSocket reconnects** — Replit's preview pane uses a proxied WebSocket to the dev server. When the container idles, the connection drops and the preview reconnects (you see "Polling for restart…" in the console).

Once deployed to Netlify, you get a static SPA served from CDN — there's no Vite dev server, no WebSocket, no HMR. The site will be completely stable.

---

## 13. Common Issues

| Problem | Solution |
|---|---|
| `/api/settings` returns 404 | API server hasn't restarted with new code yet |
| Chart shows no data (30D) | Fixed — now uses daily candles for >7 day ranges |
| Biometric login fails | Check APP_DOMAIN and APP_ORIGIN env vars |
| Session expires immediately | SESSION_SECRET is missing or too short |
| Crypto addresses not showing | Set them in Admin → Settings → Crypto Wallet Addresses |
| Payment gateway missing from modal | Gateway is disabled in Admin → Settings → Payment Gateways |
| Withdrawal method not showing | Disabled in Admin → Settings → Withdrawal Methods |
| No email notifications | Configure SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM |
| Site name still shows AlphaVest | Change it in Admin → Settings → Platform Branding → Platform Name |
| PWA install prompt not showing | Browser requires HTTPS + manifest.json. Works on Netlify, not dev. |
