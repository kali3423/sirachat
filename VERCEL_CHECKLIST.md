# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] **Code is pushed to Git repository** (GitHub, GitLab, or Bitbucket)
- [ ] **All dependencies are in package.json** - Run `npm install` to verify
- [ ] **Build works locally** - Run `npm run build` to test
- [ ] **Environment variables are documented** - Check `.env.example`
- [ ] **Base44 backend is accessible** - Verify API at `https://sira-1.base44.app/api`

## Vercel Account Setup

- [ ] **Vercel account created** - Sign up at https://vercel.com
- [ ] **Repository connected** - Import your project in Vercel dashboard
- [ ] **Project name configured** - Choose a meaningful name for your deployment

## Environment Variables Configuration

Add these in Vercel dashboard under Project Settings → Environment Variables:

### Required Variables
- [ ] `VITE_BASE44_APP_ID` = `6a90eaccbc4b30a948747d0b`
- [ ] `VITE_BASE44_API_KEY` = `57c9c4f8279e45c686cb8f3be7d08e6a`
- [ ] `VITE_BASE44_API_URL` = `https://sira-1.base44.app/api`

### Optional Variables (if needed)
- [ ] `VITE_BASE44_FUNCTIONS_VERSION` (if using specific version)
- [ ] `VITE_BASE44_APP_BASE_URL` (if needed)

## Deployment Configuration

- [ ] **vercel.json exists** - Should be in project root
- [ ] **Build command is correct** - Should be `npm run build`
- [ ] **Output directory is correct** - Should be `dist`
- [ ] **Framework preset is Vite** - Vercel should auto-detect this

## Initial Deployment

- [ ] **Deploy to production** - Click "Deploy" in Vercel dashboard
- [ ] **Wait for build to complete** - Check build logs for errors
- [ ] **Note deployment URL** - Save the URL for testing

## Post-Deployment Testing

### Basic Functionality
- [ ] **Homepage loads** - Visit your Vercel URL
- [ ] **All routes work** - Test navigation between pages
- [ ] **Assets load correctly** - Check images, fonts, styles
- [ ] **Console has no errors** - Open browser DevTools

### Authentication & API
- [ ] **Login page loads** - Navigate to `/login`
- [ ] **Can authenticate** - Try logging in with Base44 credentials
- [ ] **API calls work** - Check Network tab for successful API requests
- [ ] **Data displays correctly** - Verify content loads from Base44

### Protected Routes
- [ ] **Dashboard accessible when logged in** - Test `/` route
- [ ] **Admin route protected** - Verify `/admin` requires admin role
- [ ] **Auth redirects work** - Test unauthorized access redirects to login

### Feature Testing
- [ ] **Chat functionality** - Send and receive messages
- [ ] **Todo management** - Create, edit, delete todos
- [ ] **Study features** - Test study session tracking
- [ ] **Calendar/Agenda** - Verify event display and creation
- [ ] **Notes functionality** - Create and edit notes
- [ ] **Subject management** - Add/edit subjects
- [ ] **Timetable** - View and manage timetable
- [ ] **Games/Relax features** - Test game components
- [ ] **Recovery tracking** - Verify recovery day logging
- [ ] **Drawing board** - Test drawing functionality
- [ ] **Settings page** - Update user preferences

### Performance & UX
- [ ] **Page load speed acceptable** - Use Lighthouse or PageSpeed
- [ ] **Mobile responsive** - Test on mobile device/emulator
- [ ] **No console warnings** - Clean browser console
- [ ] **Error handling works** - Test invalid inputs/failed requests

## Domain Configuration (Optional)

- [ ] **Custom domain added** - In Vercel project settings
- [ ] **DNS configured** - Follow Vercel's DNS instructions
- [ ] **SSL certificate active** - Should be automatic
- [ ] **Domain redirects work** - Test www and non-www variants

## Continuous Deployment Setup

- [ ] **Git integration working** - Push to test auto-deploy
- [ ] **Branch previews enabled** - Verify PR preview deployments
- [ ] **Production branch set** - Usually `main` or `master`

## Security Review

- [ ] **API keys rotated if needed** - Consider using fresh keys
- [ ] **CORS configured properly** - Check Base44 backend settings
- [ ] **Admin routes verified** - Ensure backend validates admin access
- [ ] **No secrets in code** - Environment variables only
- [ ] **HTTPS enforced** - Vercel handles this automatically

## Monitoring & Maintenance

- [ ] **Vercel Analytics enabled** - Optional but recommended
- [ ] **Error tracking set up** - Consider Sentry or similar
- [ ] **Performance monitoring** - Use Vercel Speed Insights
- [ ] **Deployment notifications** - Configure Slack/Discord webhooks

## Documentation

- [ ] **Deployment URL documented** - Share with team
- [ ] **Admin credentials secured** - Store safely
- [ ] **Rollback plan documented** - Know how to revert
- [ ] **Team has access** - Add collaborators in Vercel

## Common Issues & Solutions

### Build Fails
- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Review build logs for specific errors
- Try building locally first

### Routes Don't Work (404)
- Verify vercel.json has rewrite rules
- Check that SPA routing is configured
- Ensure React Router is properly set up

### API Calls Fail
- Verify Base44 API URL is correct
- Check CORS configuration on backend
- Ensure API key is valid and set
- Check browser Network tab for details

### Authentication Issues
- Verify token storage in localStorage
- Check Base44 auth configuration
- Test with fresh browser session
- Review LocalAuthGuard logic

### Slow Loading
- Enable Vercel Edge Network
- Optimize images and assets
- Review bundle size with `npm run build`
- Consider code splitting

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Base44 Documentation**: https://docs.base44.com
- **Base44 Support**: https://app.base44.com/support
- **This Project's Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Quick Commands Reference

```bash
# Verify environment locally
npm run verify-env

# Build locally
npm run build

# Preview production build locally
npm run preview

# Deploy via CLI (if using Vercel CLI)
npm run deploy:preview  # Preview deployment
npm run deploy:vercel   # Production deployment
```

---

**Date Completed**: _______________

**Deployed By**: _______________

**Production URL**: _______________

**Notes**: 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
