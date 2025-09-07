# Deployment Guide

This guide explains how to deploy the Prompt Introspector application to GitHub Pages and Vercel.

## 🚀 GitHub Pages Deployment (Frontend)

### Automatic Deployment

The frontend automatically deploys to GitHub Pages when you push to the `main` branch.

**Requirements:**
1. GitHub Pages must be enabled in your repository settings
2. Source should be set to "GitHub Actions"

### Manual Setup

1. **Enable GitHub Pages:**
   - Go to your repository → Settings → Pages
   - Source: "GitHub Actions"

2. **Configure Repository:**
   - The `homepage` field in `frontend/package.json` should match your GitHub Pages URL
   - Current: `"https://apoorve73.github.io/prompt-introspector"`

3. **Deploy Manually:**
   ```bash
   cd frontend
   npm run build
   npm run deploy
   ```

### Workflow Files

- `.github/workflows/deploy.yml` - Simple frontend deployment
- `.github/workflows/ci-cd.yml` - Full CI/CD pipeline with testing

## 🔧 Vercel Deployment (Backend)

### Automatic Deployment

The backend can be deployed to Vercel using GitHub Actions.

**Setup:**
1. Create a Vercel project
2. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd backend
   vercel --prod
   ```

## 📋 Environment Variables

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://your-backend-url.vercel.app
```

### Backend (.env)
```env
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production
PORT=3001
```

## 🔍 Troubleshooting

### GitHub Pages Not Updating

1. **Check GitHub Actions:**
   - Go to Actions tab in your repository
   - Look for failed workflows

2. **Verify Settings:**
   - Repository → Settings → Pages
   - Source should be "GitHub Actions"

3. **Check Permissions:**
   - Repository → Settings → Actions → General
   - "Workflow permissions" should allow "Read and write permissions"

### Common Issues

1. **Build Failures:**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed

2. **CORS Issues:**
   - Update `REACT_APP_BACKEND_URL` in frontend
   - Verify backend CORS configuration

3. **API Key Issues:**
   - Ensure environment variables are set correctly
   - Check API key permissions

## 🎯 Quick Commands

```bash
# Frontend deployment
cd frontend && npm run deploy

# Backend deployment (if using Vercel CLI)
cd backend && vercel --prod

# Full project build
npm run build  # In both frontend and backend directories
```

## 📊 Monitoring

- **GitHub Pages:** Check Actions tab for deployment status
- **Vercel:** Check Vercel dashboard for deployment logs
- **Application:** Monitor browser console for runtime errors