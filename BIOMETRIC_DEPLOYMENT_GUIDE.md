# Biometric Authentication Deployment Guide

## Overview
This guide helps you deploy and configure the biometric authentication feature (fingerprint, Face ID, Windows Hello) for Beta Capital Investment.

## Prerequisites

### 1. HTTPS Required
WebAuthn (biometric authentication) **requires HTTPS** in production. It will only work on:
- ✅ `https://` URLs in production
- ✅ `http://localhost` in development

❌ It will NOT work on `http://` with a non-localhost domain.

### 2. Browser Support
Ensure your users have modern browsers:
- Chrome 67+
- Firefox 60+
- Safari 13+
- Edge 18+

### 3. Device Requirements
Users need devices with:
- Biometric hardware (fingerprint reader, Face ID, Windows Hello, etc.)
- Biometrics enrolled in their operating system

## Environment Configuration

### For Production (Netlify/Vercel/etc.)

Set these environment variables in your hosting platform:

```bash
# Your actual domain (without protocol)
APP_DOMAIN=betacapitalinvestment.com

# Full URL with HTTPS protocol
APP_ORIGIN=https://betacapitalinvestment.com

# Other required variables
DATABASE_URL=your_production_database_url
SESSION_SECRET=your_secure_random_32_char_secret
NODE_ENV=production
FRONTEND_URL=https://betacapitalinvestment.com
```

### For Local Development

Your `.env` file should have:

```bash
APP_DOMAIN=localhost
APP_ORIGIN=http://localhost:5173
```

## Netlify Configuration

Your `netlify.toml` already includes the necessary configuration:

```toml
[build.environment]
  # ... other variables
  APP_DOMAIN = ""
  APP_ORIGIN = ""
```

Make sure to set actual values in the Netlify dashboard under:
**Site settings → Environment variables**

## Testing the Deployment

### 1. Backend Health Check

After deployment, verify the biometric endpoints are accessible:

```bash
# Test that the API is responding
curl https://your-domain.com/api/health

# The biometric routes should be mounted (will return 401 without session)
curl -X POST https://your-domain.com/api/auth/biometric/register-options
# Expected: {"message": "Not authenticated"} or similar
```

### 2. Frontend Test

1. **Register a test user**:
   - Go to your deployed site
   - Sign up with email/password
   - Verify email if required

2. **Enable biometric**:
   - Log in with email/password
   - Click on Settings (gear icon)
   - Scroll to Security section
   - Click "Register Biometric"
   - Follow browser prompt to use fingerprint/Face ID
   - You should see "Active" badge and success message

3. **Test biometric login**:
   - Log out
   - On login screen, click "Sign In with Biometrics"
   - Enter your email
   - Click "Authenticate"
   - Use fingerprint/Face ID when prompted
   - Should log you in successfully

## Troubleshooting

### Issue: "Biometric registration failed"

**Possible causes:**
1. Not using HTTPS (in production)
2. `APP_DOMAIN` or `APP_ORIGIN` misconfigured
3. Browser doesn't support WebAuthn
4. Device doesn't have biometric hardware
5. User hasn't enrolled biometrics in OS

**Solutions:**
- Check browser console for detailed errors
- Verify environment variables are set correctly
- Ensure HTTPS is working
- Test on a different device/browser

### Issue: "Biometric login not set up for this account"

**Cause:** User hasn't registered biometric yet.

**Solution:** User must first:
1. Log in with password
2. Go to Settings → Security
3. Click "Register Biometric"

### Issue: Origins don't match

**Cause:** `APP_ORIGIN` doesn't match the actual URL users are accessing.

**Common mistakes:**
- ❌ `APP_ORIGIN=betacapitalinvestment.com` (missing protocol)
- ❌ `APP_ORIGIN=https://betacapitalinvestment.com/` (trailing slash)
- ✅ `APP_ORIGIN=https://betacapitalinvestment.com` (correct)

**Solution:**
- Ensure `APP_ORIGIN` exactly matches what users type in their browser
- No trailing slashes
- Must include protocol (`https://`)

### Issue: "Failed to start registration"

**Check:**
1. Backend logs for detailed error messages
2. Ensure biometric routes are registered in `routes/index.ts`
3. Verify database has `biometric_credentials` table
4. Check user has an active session

### Issue: Database errors

**Verify schema:**
```sql
-- Check if tables exist
SELECT * FROM information_schema.tables 
WHERE table_name IN ('users', 'biometric_credentials');

-- Check if biometricEnabled column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'biometricEnabled';
```

## Database Schema Reference

The biometric feature requires these database tables:

### `users` table
```typescript
biometricEnabled: boolean().notNull().default(false)
```

### `biometric_credentials` table
```typescript
{
  id: text("id").primaryKey(), // Base64url encoded credential ID
  userId: integer("user_id").notNull().references(() => usersTable.id),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type").notNull(), // "singleDevice" or "multiDevice"
  backedUp: boolean("backed_up").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}
```

## Security Considerations

### ✅ What's Secure
- Private keys never leave the user's device
- Credentials are device-specific
- Counter validation prevents replay attacks
- Origin validation prevents phishing

### 🔒 Best Practices
- Always use HTTPS in production
- Keep `@simplewebauthn` packages updated
- Monitor for suspicious authentication patterns
- Allow users to remove/re-register biometrics

### ⚠️ Limitations
- Users can only use biometric on devices they've registered
- If device is lost, user must use password to log in and re-register
- Each device needs separate registration

## User Flow Diagrams

### Registration Flow
```
User logged in with password
    ↓
Navigate to Settings → Security
    ↓
Click "Register Biometric"
    ↓
Backend generates challenge
    ↓
Browser prompts for biometric
    ↓
User provides fingerprint/Face ID
    ↓
Browser creates credential (private key stays on device)
    ↓
Public key sent to backend
    ↓
Backend stores credential in database
    ↓
"Active" badge appears
```

### Login Flow
```
User on login screen
    ↓
Click "Sign In with Biometrics"
    ↓
Enter email address
    ↓
Click "Authenticate"
    ↓
Backend sends challenge
    ↓
Browser prompts for biometric
    ↓
User provides fingerprint/Face ID
    ↓
Browser signs challenge with private key
    ↓
Signed response sent to backend
    ↓
Backend verifies signature
    ↓
User logged in
```

## Monitoring and Analytics

Consider tracking these metrics:
- % of users with biometric enabled
- Biometric login success rate
- Biometric login failure reasons
- Device types used for biometric

## Support Resources

- [WebAuthn Guide](https://webauthn.guide/)
- [SimpleWebAuthn Docs](https://simplewebauthn.dev/)
- [Browser Compatibility](https://caniuse.com/webauthn)

## Rollback Plan

If you need to disable biometric authentication:

1. Comment out the biometric router in `routes/index.ts`:
```typescript
// router.use(authBiometricRouter);
```

2. Hide the UI (optional):
```typescript
// In DashboardView.tsx, wrap biometric section in conditional:
{false && (
  <div className="bg-brand-bg border border-brand-border rounded-lg p-4">
    {/* Biometric UI */}
  </div>
)}
```

Users with biometric enabled can still log in with password.

## Next Steps

After successful deployment:
1. ✅ Test biometric registration on multiple devices
2. ✅ Test biometric login from different browsers
3. ✅ Monitor error logs for issues
4. ✅ Document for your users how to enable biometric
5. ✅ Consider adding biometric prompt during signup flow
