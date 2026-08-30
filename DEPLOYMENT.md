# Vercel Deployment Guide

This guide will help you deploy your Base44 app to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional): `npm i -g vercel`
3. Your Base44 backend is running at: `https://sira-1.base44.app/api`

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push origin main
   ```

2. **Import your project in Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - Vercel will automatically detect it's a Vite project

3. **Configure Environment Variables**
   In the Vercel dashboard, add these environment variables:
   - `VITE_BASE44_APP_ID`: `6a90eaccbc4b30a948747d0b`
   - `VITE_BASE44_API_KEY`: `57c9c4f8279e45c686cb8f3be7d08e6a`
   - `VITE_BASE44_API_URL`: `https://sira-1.base44.app/api`

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? Select your account
   - Link to existing project? No
   - Project name? (press enter for default or type a name)
   - In which directory is your code located? ./
   
4. **Add Environment Variables**
   ```bash
   vercel env add VITE_BASE44_APP_ID
   vercel env add VITE_BASE44_API_KEY
   vercel env add VITE_BASE44_API_URL
   ```
   
   Enter the values when prompted for each.

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Project Configuration

The following files have been configured for Vercel deployment:

### `vercel.json`
- Configures build settings
- Sets up SPA routing (all routes redirect to index.html)
- Configures CORS headers for API requests
- Sets environment variables

### `.vercelignore`
- Specifies files to ignore during deployment
- Excludes node_modules, build artifacts, and local config

### `.env.production`
- Production environment variables
- **Note**: This file is for reference. Set actual values in Vercel dashboard.

## Routes Configuration

All routes in your app are client-side and handled by React Router:

- `/` - Chat page
- `/login` - Login page
- `/todos` - Todos page
- `/agenda` - Agenda page
- `/schedule` - Study Schedule
- `/study` - Study page
- `/notes` - Notes page
- `/subjects` - Subjects page
- `/timetable` - Timetable page
- `/relax` - Relax/Games page
- `/recovery` - Recovery tracking
- `/drawing` - Drawing board
- `/settings` - Settings page
- `/admin` - Admin panel (protected route)

## Admin Route

The `/admin` route is protected by the `AdminGate` component, which checks if the user has the `admin` role in the Base44 User entity.

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly
- Check build logs in Vercel dashboard

### API Connection Issues
- Verify Base44 API URL is correct
- Check CORS settings on your Base44 backend
- Ensure API key is valid

### Routing Issues
- All client-side routes are handled by the SPA
- `vercel.json` rewrites all requests to `/index.html`
- Make sure React Router is properly configured

### Authentication Issues
- Check that Base44 authentication is working
- Verify token storage in localStorage
- Check `LocalAuthGuard` component logic

## Post-Deployment

After deployment:

1. **Test all routes** - Navigate through your app to ensure all pages load
2. **Test authentication** - Try logging in and accessing protected routes
3. **Test API calls** - Verify data is loading from Base44 backend
4. **Test admin access** - Ensure admin routes are properly protected
5. **Check mobile responsiveness** - Test on different devices

## Continuous Deployment

Once connected to your Git repository:
- Every push to `main` branch triggers a production deployment
- Pull requests create preview deployments
- Preview URLs are automatically generated for testing

## Support

- Vercel Docs: https://vercel.com/docs
- Base44 Docs: https://docs.base44.com
- React Router Docs: https://reactrouter.com

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Keys**: Your Base44 API key is exposed in the frontend code. Ensure your Base44 backend has proper authentication and authorization.

2. **Environment Variables**: While prefixed with `VITE_`, these variables are embedded in the client bundle and visible to users.

3. **Admin Protection**: Admin routes are protected on the frontend, but ensure your Base44 backend also validates admin permissions on API endpoints.

4. **CORS**: The current configuration allows all origins (`*`). Consider restricting this in production to your specific domain.
