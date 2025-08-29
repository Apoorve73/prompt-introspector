# Vercel Backend Deployment Guide

## Prerequisites

**⚠️ Important**: You need Node.js 18+ to use Vercel CLI. Your current Node.js version (14.21.3) is too old.

## Option 1: Update Node.js (Recommended)

### Using nvm (Node Version Manager):
```bash
# Install Node.js 18 LTS
nvm install 18
nvm use 18

# Verify version
node --version  # Should show v18.x.x
```

### Using Homebrew:
```bash
brew install node@18
brew link node@18
```

## Option 2: Deploy via Vercel Dashboard (No CLI needed)

### Step 1: Prepare Your Repository
1. Ensure all changes are committed and pushed to GitHub
2. Your backend is already configured with:
   - `vercel.json` configuration
   - Proper CORS settings for GitHub Pages
   - Environment variables ready

### Step 2: Deploy via Vercel.com
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `apoorve73/prompt-introspector`
4. Configure the project:
   - **Framework Preset**: Node.js
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables
In your Vercel project dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   OPENAI_API_KEY = sk-your-actual-openai-api-key
   NODE_ENV = production
   ```

### Step 4: Deploy
1. Click **Deploy**
2. Wait for deployment to complete
3. Copy your deployment URL (e.g., `https://your-project.vercel.app`)

## Option 3: Deploy with Updated Node.js

After updating to Node.js 18+:

```bash
# Navigate to backend directory
cd backend

# Login to Vercel (first time only)
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [your-username]
# - Link to existing project? N
# - Project name: prompt-introspector-backend
# - In which directory is your code located? ./
# - Want to override the settings? N
```

## Configuration Files Already Created

### `backend/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### CORS Configuration Updated
Your server.js now allows requests from:
- `http://localhost:3000` (development)
- `https://apoorve73.github.io` (GitHub Pages)
- `https://prompt-introspector.vercel.app` (Vercel)

## After Deployment

### 1. Update Frontend Configuration
Once deployed, update `frontend/src/config.js`:
```javascript
production: {
  apiBaseUrl: 'https://your-vercel-url.vercel.app/api',
}
```

### 2. Redeploy Frontend
```bash
cd frontend
npm run deploy
```

### 3. Test Integration
- Frontend: `https://apoorve73.github.io/prompt-introspector`
- Backend: `https://your-vercel-url.vercel.app/api/health`

## Troubleshooting

### Common Issues:
1. **Node.js Version**: Ensure you're using Node.js 18+
2. **Environment Variables**: Check Vercel dashboard for correct API keys
3. **CORS Errors**: Verify the frontend URL is in the allowed origins
4. **Build Failures**: Check Vercel build logs for dependency issues

### Vercel Build Logs:
- Check your project dashboard for detailed error logs
- Common issues include missing dependencies or syntax errors

## Alternative Deployment Options

If Vercel doesn't work, consider:
1. **Railway**: Great for Node.js apps
2. **Render**: Simple deployment with free tier
3. **Heroku**: Traditional hosting (requires credit card)

## Next Steps

1. **Update Node.js** to version 18+
2. **Deploy backend** to Vercel (either via CLI or dashboard)
3. **Update frontend config** with backend URL
4. **Redeploy frontend** to GitHub Pages
5. **Test the complete application**
