# Troubleshooting Guide

Common issues and solutions for Vercel deployment and Base44 integration.

## Build Issues

### Error: "Module not found" or "Cannot find module"

**Cause**: Missing dependency or incorrect import path

**Solutions**:
1. Install missing package: `npm install <package-name>`
2. Check import paths are correct (case-sensitive)
3. Verify package is in `dependencies`, not just `devDependencies`
4. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Error: "Process exited with code 1" during build

**Cause**: Build script failed, often due to TypeScript or ESLint errors

**Solutions**:
1. Run `npm run build` locally to see full error
2. Check for TypeScript errors: `npm run typecheck`
3. Check for linting issues: `npm run lint`
4. Review Vercel build logs for specific error messages

### Error: "Environment variable not found"

**Cause**: Required environment variables not set in Vercel

**Solutions**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required `VITE_*` variables
3. Redeploy after adding variables
4. Verify variable names match exactly (case-sensitive)

## Runtime Issues

### 404 Error on Routes

**Symptom**: Direct navigation to routes like `/admin` returns 404

**Cause**: SPA routing not configured properly

**Solutions**:
1. Verify `vercel.json` exists with rewrite rules
2. Check that the rewrite points to `/index.html`
3. Ensure React Router is properly configured in `App.jsx`
4. Redeploy after fixing `vercel.json`

### Blank Page After Deployment

**Cause**: JavaScript errors preventing app from loading

**Solutions**:
1. Open browser DevTools Console (F12) and check for errors
2. Check Network tab for failed resource requests
3. Verify environment variables are set
4. Check that the correct `dist` folder is being deployed

### "Failed to fetch" or API Errors

**Symptom**: API calls to Base44 backend fail

**Solutions**:
1. Verify `VITE_BASE44_API_URL` is correct: `https://sira-1.base44.app/api`
2. Check Base44 backend is accessible: Visit API URL in browser
3. Verify API key is correct in environment variables
4. Check browser console for CORS errors
5. Test API endpoint with curl or Postman:
   ```bash
   curl -H "api_key: 57c9c4f8279e45c686cb8f3be7d08e6a" \
     https://sira-1.base44.app/api/entities/User
   ```

### CORS Errors

**Symptom**: "Access-Control-Allow-Origin" errors in console

**Cause**: Base44 backend not allowing requests from Vercel domain

**Solutions**:
1. Add your Vercel domain to Base44 CORS settings
2. Verify `vercel.json` includes CORS headers
3. Check Base44 backend configuration for allowed origins
4. Try accessing API directly to rule out network issues

## Authentication Issues

### Can't Log In

**Solutions**:
1. Verify Base44 authentication is configured correctly
2. Check that User entity exists in Base44
3. Clear browser localStorage: `localStorage.clear()`
4. Check browser console for auth-related errors
5. Verify `LocalAuthProvider` is properly configured

### "Unauthorized" or 401 Errors

**Solutions**:
1. Check that API key is set correctly
2. Verify token is being stored in localStorage
3. Clear localStorage and re-authenticate
4. Check token expiration in Base44 settings

### Admin Route Not Accessible

**Solutions**:
1. Verify user has `role: "admin"` in User entity
2. Check `AdminGate` component logic
3. Verify backend validates admin access
4. Test with a known admin user

## Performance Issues

### Slow Page Load

**Solutions**:
1. Run Lighthouse audit in Chrome DevTools
2. Optimize images (use WebP, compress, lazy load)
3. Check bundle size: `npm run build` and review dist folder
4. Consider code splitting for large components
5. Enable Vercel Speed Insights

### Large Bundle Size

**Solutions**:
1. Analyze bundle: Install `rollup-plugin-visualizer`
2. Lazy load routes with React.lazy() and Suspense
3. Remove unused dependencies
4. Use tree-shaking by importing only needed components:
   ```javascript
   // Instead of
   import * as Icons from 'lucide-react';
   
   // Use
   import { Home, User } from 'lucide-react';
   ```

## Data Issues

### Data Not Loading

**Solutions**:
1. Check browser Network tab for failed API requests
2. Verify entity names match Base44 schema
3. Check query filters are correctly formatted
4. Test API endpoint directly with curl
5. Verify user has permission to access entity

### Data Not Saving

**Solutions**:
1. Check browser console for validation errors
2. Verify required fields are provided
3. Check Base44 entity schema for field requirements
4. Test create/update with minimal data first
5. Verify API key has write permissions

### Wrong Data Displayed

**Solutions**:
1. Clear browser cache and hard reload (Ctrl+Shift+R)
2. Check React Query cache: Clear and refetch
3. Verify correct entity is being queried
4. Check query filters for typos
5. Test in incognito mode to rule out caching

## Development Environment Issues

### "base44 dev" Not Working

**Solutions**:
1. Ensure Base44 CLI is installed: `npm install -g base44@latest`
2. Run `base44 login` if not authenticated
3. Run `base44 link` in project directory
4. Check that `base44/.app.jsonc` exists
5. Verify Deno is installed for local backend

### Port Already in Use

**Solutions**:
1. Kill process using the port:
   ```bash
   # Find process
   npx kill-port 5173
   
   # Or manually
   lsof -ti:5173 | xargs kill -9
   ```
2. Use a different port in `vite.config.js`:
   ```javascript
   export default defineConfig({
     server: { port: 3000 }
   })
   ```

## Vercel-Specific Issues

### Deployment Stuck or Pending

**Solutions**:
1. Check Vercel status page: https://vercel-status.com
2. Cancel deployment and retry
3. Check build logs for frozen processes
4. Contact Vercel support if persistent

### Environment Variables Not Working

**Solutions**:
1. Ensure variables are prefixed with `VITE_` for client-side access
2. Redeploy after adding/changing variables
3. Check variable names have no typos (case-sensitive)
4. Verify variables are set for correct environment (Production/Preview/Development)

### Old Version Still Showing

**Solutions**:
1. Hard refresh browser: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. Clear browser cache
3. Check deployment status in Vercel dashboard
4. Verify correct domain (might be looking at preview URL)
5. Check if CDN caching is causing issues

## Getting Help

### Before Asking for Help

Gather this information:
- [ ] Exact error message (screenshot or copy/paste)
- [ ] Browser console logs (DevTools → Console)
- [ ] Network tab showing failed requests
- [ ] Steps to reproduce the issue
- [ ] Environment (browser, OS, device)
- [ ] Vercel deployment URL
- [ ] What you've already tried

### Support Resources

1. **Vercel Community**: https://github.com/vercel/vercel/discussions
2. **Base44 Support**: https://app.base44.com/support
3. **React Router Docs**: https://reactrouter.com
4. **Stack Overflow**: Tag questions with `vercel`, `base44`, `react`

### Useful Debugging Commands

```bash
# Check environment variables are loaded
npm run verify-env

# Build locally to see errors
npm run build

# Preview production build
npm run preview

# Check for outdated packages
npm outdated

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# View Vercel logs
vercel logs [deployment-url]

# Check Vercel deployment status
vercel inspect [deployment-url]
```

### Browser DevTools Debugging

1. **Console Tab**: View JavaScript errors and logs
2. **Network Tab**: See all API requests and responses
   - Filter by "XHR" to see only API calls
   - Check request headers include API key
   - Check response status codes
3. **Application Tab**: 
   - Check localStorage for auth tokens
   - View cookies
   - Clear storage to reset state
4. **Sources Tab**: Set breakpoints in JavaScript code

## Additional Tips

### Test Locally Before Deploying

Always test changes locally before deploying:
```bash
# Build locally
npm run build

# Preview the build
npm run preview

# Visit http://localhost:4173 to test
```

### Use Preview Deployments

- Create a branch for changes
- Push to test automatic preview deployment
- Share preview URL for testing
- Merge to main only after verifying preview

### Monitor Your Deployments

- Enable Vercel Analytics for usage insights
- Set up error tracking (Sentry, LogRocket)
- Monitor performance with Lighthouse CI
- Set up deployment notifications in Slack/Discord

### Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update <package-name>

# Test after updates
npm run build && npm run preview
```

---

**Can't find your issue?** Check the full deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md) or the checklist in [VERCEL_CHECKLIST.md](./VERCEL_CHECKLIST.md).
