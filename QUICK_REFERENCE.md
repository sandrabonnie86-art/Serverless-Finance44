# Beta Capital Investment - Quick Reference

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
pnpm install

# Start API server
cd artifacts/api-server
pnpm run dev

# In another terminal, start frontend
cd artifacts/bettercapitalinvestment
pnpm run dev
```

---

## 💰 Investment Tiers

| Tier | Minimum | Daily ROI | Color |
|------|---------|-----------|-------|
| **Classic** | $5,000 | 0.25% | 🥉 |
| **Pro** | $25,000 | 0.45% | 🥈 |
| **VIP** | $100,000 | 0.70% | 🥇 |

---

## 🔐 Biometric Authentication

### Setup (User)
1. Log in with password
2. Settings → Security
3. Click "Register Biometric"
4. Follow device prompt

### Login (User)
1. Click "Sign In with Biometrics"
2. Enter email
3. Use fingerprint/Face ID

### Environment Variables (Developer)
```bash
# Production
APP_DOMAIN=betacapitalinvestment.com
APP_ORIGIN=https://betacapitalinvestment.com

# Local
APP_DOMAIN=localhost
APP_ORIGIN=http://localhost:5173
```

---

## 🎨 Branding

**Name:** Beta Capital Investment  
**Domain:** betacapitalinvestment.com  
**Email:** support@betacapitalinvestment.com  
**Theme Color:** #f2ca50 (brand-gold)

---

## 📱 UI Features

### Mobile Navigation
- Auto-closes after selection
- Auto-scrolls to top
- "Invest" tab (formerly "Positions")

### Click Effect
- `.click-glow` CSS class available
- Golden glow on button press
- 0.4s animation

---

## 🔧 Key Files

```
artifacts/
├── api-server/
│   ├── src/routes/
│   │   ├── index.ts (router registration)
│   │   ├── auth-biometric.ts (biometric endpoints)
│   │   └── admin.ts (tier config)
│   └── .env (environment variables)
└── bettercapitalinvestment/
    ├── src/
    │   ├── components/
    │   │   ├── LoginView.tsx (biometric login)
    │   │   ├── DashboardView.tsx (biometric registration)
    │   │   └── MobileNav.tsx (drawer)
    │   ├── data.ts (tiers definition)
    │   └── index.css (click glow effect)
    └── public/
        └── manifest.json (PWA config)
```

---

## 🐛 Common Issues

### Biometric Not Working
- ✅ Check HTTPS enabled
- ✅ Verify APP_DOMAIN and APP_ORIGIN
- ✅ Ensure modern browser
- ✅ Check device has biometric hardware
- ✅ View browser console for errors

### Deployment Failed
- ✅ Check build command: `@workspace/BetterCapitalInvestment`
- ✅ Check publish dir: `artifacts/bettercapitalinvestment/dist/public`
- ✅ Verify environment variables set

### Tier Issues
- ✅ Minimum is $5,000 (not $3,000)
- ✅ Only 3 tiers (not 5)
- ✅ Names: Classic, Pro, VIP (not "Ore" names)

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `COMPLETION_SUMMARY.md` | Overview of all changes |
| `BIOMETRIC_FIX_SUMMARY.md` | Technical biometric details |
| `BIOMETRIC_DEPLOYMENT_GUIDE.md` | Biometric deployment steps |
| `CONFIGURATION.md` | General configuration guide |
| `QUICK_REFERENCE.md` | This file |

---

## ✅ Testing Checklist

- [ ] User registration works
- [ ] Email/password login works
- [ ] Biometric registration works
- [ ] Biometric login works
- [ ] Tier system displays correctly
- [ ] Minimum $5,000 investment enforced
- [ ] Mobile drawer closes after nav
- [ ] All branding shows "Beta Capital Investment"
- [ ] Admin dashboard accessible
- [ ] Deposits/withdrawals functional

---

## 🚨 Production Environment Variables

**Critical:**
```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secure-random-32-char-secret
NODE_ENV=production
APP_DOMAIN=betacapitalinvestment.com
APP_ORIGIN=https://betacapitalinvestment.com
FRONTEND_URL=https://betacapitalinvestment.com
```

**Optional:**
```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...
PAYSTACK_SECRET_KEY=...
```

---

## 🎯 Status

| Feature | Status |
|---------|--------|
| Rebranding | ✅ Complete |
| 3-Tier System | ✅ Complete |
| $5K Minimum | ✅ Complete |
| Biometric Auth | ✅ Complete |
| Drawer Auto-Close | ✅ Complete |
| Click Glow Effect | ✅ Complete |
| Netlify Config | ✅ Complete |

**Ready for Production** ✅

---

## 📞 Support

Need help? Check:
1. Browser console for errors
2. Network tab for failed requests
3. Server logs for backend issues
4. Documentation files in this directory
5. Environment variables are set

---

**Last Updated:** June 12, 2026  
**Version:** 2.0.0  
**Project:** Beta Capital Investment
