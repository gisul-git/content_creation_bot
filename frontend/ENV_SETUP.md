# Environment Variables Setup Guide

## Quick Answer

**Yes, you can add `NEXT_PUBLIC_API_URL=http://localhost:8000` to your `.env` file!**

## Next.js Environment Variable Priority

Next.js loads environment variables in this order (highest priority first):

1. `.env.local` - Local overrides (gitignored, highest priority)
2. `.env.development` / `.env.production` - Environment-specific
3. `.env` - Default values (can be committed to git)

## Option 1: Add to `.env` (What you have)

Since you already have a `.env` file, simply add:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Pros:**
- ✅ Simple - just add to existing file
- ✅ Can be committed to git (if you want)
- ✅ Works for all environments

**Cons:**
- ⚠️ If committed, everyone uses same URL
- ⚠️ Less flexible for different developers

## Option 2: Use `.env.local` (Recommended)

Create a `.env.local` file in the `frontend/` directory:

```bash
# In frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Pros:**
- ✅ Gitignored (won't be committed)
- ✅ Each developer can have different settings
- ✅ Overrides `.env` values
- ✅ Best practice for local development

**Cons:**
- ⚠️ Need to create new file

## Your Current Setup

Based on your question, you have a `.env` file. Here's what to do:

### Step 1: Add the variable to `.env`

Open your `.env` file (in the `frontend/` directory) and add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 2: Verify it works

1. Restart your Next.js dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. Check the browser console - API calls should go to `http://localhost:8000`

## Important Notes

### Variable Naming
- ✅ **`NEXT_PUBLIC_` prefix** - Required for client-side variables
- ❌ Without prefix - Only available on server-side

### File Location
Make sure the `.env` file is in the **`frontend/`** directory (same level as `package.json`):

```
frontend/
├── .env              ← Here
├── .env.local         ← Or here (recommended)
├── package.json
└── src/
```

### After Changing Variables
**Always restart the Next.js dev server** after changing environment variables:
```bash
# Stop (Ctrl+C) and restart
npm run dev
```

## Example `.env` File

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Site URL for SEO
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Troubleshooting

### Variable not working?
1. ✅ Check file is in `frontend/` directory
2. ✅ Check variable name starts with `NEXT_PUBLIC_`
3. ✅ Restart dev server after changes
4. ✅ Check for typos (no spaces around `=`)

### Different URL for production?
Create `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Summary

**For your case:** Just add this line to your existing `.env` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then restart `npm run dev` and you're good to go! 🚀

