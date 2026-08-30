# 🚀 Development Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Base44 CLI (optional, for full backend development)

## Quick Start

### Option 1: Frontend Development (Recommended for Design Work)

Connect to your **production** Base44 backend:

```bash
npm install
npm run dev
```

This will:
- ✅ Start Vite dev server (usually on http://localhost:5173)
- ✅ Connect to your live Base44 backend at `https://app.base44.com`
- ✅ Use your production data
- ⚠️ **Note**: Changes affect real data!

### Option 2: Full Stack Development with Base44 CLI

For backend development with local data:

```bash
# Install Base44 CLI globally
npm install -g base44@latest

# Login (one-time per machine)
base44 login

# Link project (one-time per clone)
base44 link

# Run with local backend (throwaway data)
base44 dev

# OR run with remote backend (production data)
base44 dev --remote
```

## Environment Variables

The app uses these environment variables (already configured in `.env.local`):

```bash
VITE_BASE44_APP_ID=6a90eaccbc4b30a948747d0b
VITE_BASE44_API_KEY=57c9c4f8279e45c686cb8f3be7d08e6a
VITE_BASE44_API_URL=https://app.base44.com
VITE_BASE44_APP_BASE_URL=https://app.base44.com
```

**Important**: Never commit `.env.local` to git!

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run preview          # Preview production build locally

# Build
npm run build            # Build for production (output: dist/)

# Quality Checks
npm run lint             # Check code quality
npm run lint:fix         # Fix auto-fixable linting issues
npm run typecheck        # Check TypeScript types

# Deployment
npm run verify-env       # Verify environment variables
npm run deploy:preview   # Deploy preview to Vercel
npm run deploy:vercel    # Deploy production to Vercel
```

## Troubleshooting

### Port 5173 Already in Use

If you see "Port 5173 is in use":

**Windows (PowerShell)**:
```powershell
# Find and kill process
Get-NetTCPConnection -LocalPort 5173 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Mac/Linux**:
```bash
# Find process
lsof -ti:5173

# Kill it
kill -9 $(lsof -ti:5173)
```

Or just let Vite use another port automatically.

### Base44 Backend Not Configured

If you see "[base44] No Base44 backend configured":

1. Make sure `.env.local` exists with correct values
2. Restart your dev server: `Ctrl+C` then `npm run dev`
3. Check that `VITE_BASE44_APP_BASE_URL` is set

### Missing Dependencies

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Project Structure

```
sirachat/
├── src/
│   ├── api/              # API client configuration
│   │   └── base44Client.js
│   ├── components/       # React components
│   │   ├── ui/          # UI components (shadcn)
│   │   ├── chat/        # Chat-specific components
│   │   └── ...
│   ├── pages/           # Page components
│   ├── lib/             # Utilities and helpers
│   ├── hooks/           # Custom React hooks
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── base44/              # Base44 backend configuration
│   ├── config.jsonc     # Base44 project config
│   └── entities/        # Entity schemas
├── public/              # Static assets
│   ├── logo.svg         # App logo
│   ├── favicon.svg      # Favicon
│   └── manifest.json    # PWA manifest
├── .env.local           # Local environment (gitignored)
├── .env.production      # Production environment template
├── vercel.json          # Vercel deployment config
└── vite.config.js       # Vite configuration
```

## Development Workflow

### 1. Start Development
```bash
npm run dev
```

### 2. Make Changes
Edit files in `src/` - Vite will hot reload automatically

### 3. Test Your Changes
- Check the browser (usually http://localhost:5173)
- Check the browser console for errors
- Test on mobile viewport (DevTools → Toggle device toolbar)

### 4. Commit Your Changes
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

### 5. Deploy (Optional)
If connected to Vercel, pushing to `main` automatically deploys!

## Hot Reload

Vite provides instant hot module replacement (HMR):
- ⚡ CSS changes apply instantly
- ⚡ Component changes reload that component only
- ⚡ State is preserved when possible

## Development Tips

### 1. Use React DevTools
Install the React DevTools browser extension to inspect components.

### 2. Use Console Logging
```javascript
console.log('Debug:', variable);
console.table(arrayOfObjects);
console.group('Group Name');
```

### 3. Test Responsiveness
Use Chrome DevTools device toolbar to test mobile views:
- iPhone SE (375px)
- iPhone 14 Pro (393px)
- iPad (768px)
- Desktop (1024px+)

### 4. Check Network Tab
Monitor API calls in DevTools Network tab:
- Filter by "Fetch/XHR"
- Check request/response payloads
- Verify Base44 API calls

### 5. Dark Mode Testing
Toggle between light and dark mode:
- Most systems: System Preferences
- Or add a theme toggle in your app

## Base44 Specific

### Entity Schemas
Base44 entities are defined in `base44/entities/*.jsonc`

Entities in your app:
- User
- Message
- Todo
- Event
- Subject
- Lesson
- StudySession
- StudyNote
- TimetableEntry
- RecoveryDay
- And more...

### API Usage
```javascript
import { base44 } from '@/api/base44Client';

// List entities
const messages = await base44.entities.Message.list();

// Create entity
const newMessage = await base44.entities.Message.create({
  text: "Hello!",
  sender_name: "User",
  recipient: "Friend"
});

// Update entity
await base44.entities.Message.update(id, { read: true });

// Delete entity
await base44.entities.Message.delete(id);
```

### Realtime Subscriptions
```javascript
const unsub = base44.entities.Message.subscribe((event) => {
  if (event.type === 'create') {
    // New message
  }
  if (event.type === 'update') {
    // Message updated
  }
  if (event.type === 'delete') {
    // Message deleted
  }
});

// Cleanup
return unsub;
```

## Getting Help

### Base44 Documentation
- **Docs**: https://docs.base44.com
- **CLI Reference**: https://docs.base44.com/developers/references/cli
- **Support**: https://app.base44.com/support

### Vite Documentation
- **Guide**: https://vitejs.dev/guide/
- **Config**: https://vitejs.dev/config/

### React Documentation
- **Docs**: https://react.dev

### Troubleshooting Steps
1. Check browser console for errors
2. Check terminal for build errors
3. Verify `.env.local` is configured
4. Clear cache: `rm -rf node_modules/.vite`
5. Restart dev server
6. Check Base44 backend status

## Performance Monitoring

### Lighthouse
Run Lighthouse in Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"

### Bundle Size
Check your production bundle size:
```bash
npm run build
```

Look for the output in `dist/assets/`.

## Production Build

Before deploying:
```bash
# 1. Build
npm run build

# 2. Preview locally
npm run preview

# 3. Test the preview
# Visit http://localhost:4173

# 4. Deploy
# Push to main branch (auto-deploys to Vercel)
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `base44 dev` | Run with local Base44 backend |
| `base44 dev --remote` | Run with remote backend |

**Happy coding! 🎉**
