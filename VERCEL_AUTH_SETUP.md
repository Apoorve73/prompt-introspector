# Vercel Authentication Setup Guide

## Overview
This guide explains how to authenticate your frontend requests to your Vercel-protected backend using the `X-Vercel-Id` header.

## Step 1: Get Your Vercel ID Token

### 1.1 Access Vercel Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Sign in to your account

### 1.2 Navigate to Tokens
- Click on your profile picture (top right)
- Select **Settings**
- Go to **Tokens** section in the left sidebar

### 1.3 Create New Token
- Click **Create Token**
- Give it a descriptive name (e.g., "Prompt Introspector API")
- Set the scope to your specific project
- Click **Create**
- **Copy the token value** (you won't see it again!)

## Step 2: Configure Environment Variables

### 2.1 Create .env file
In your `frontend/` directory, create a `.env` file:

```bash
cd frontend
touch .env
```

### 2.2 Add Your Vercel ID
Add this line to your `.env` file:

```env
REACT_APP_VERCEL_ID=your-actual-vercel-token-here
```

**Important:** Replace `your-actual-vercel-token-here` with the token you copied in Step 1.

## Step 3: Update Your Code

The code has already been updated to include the `X-Vercel-Id` header in all API calls:

- `GET /default-key` - Check for default API key
- `POST /tokenize` - Tokenize text
- `POST /set-key` - Set API key
- `POST /chat/completions` - Chat with OpenAI

## Step 4: Test Authentication

### 4.1 Restart Development Server
```bash
cd frontend
npm start
```

### 4.2 Check Network Tab
- Open browser DevTools
- Go to Network tab
- Make a request to your app
- Verify the `X-Vercel-Id` header is being sent

## Step 5: Deploy to Production

### 5.1 Build and Deploy
```bash
npm run deploy
```

### 5.2 Set Environment Variable in GitHub Pages
Since GitHub Pages doesn't support `.env` files, you'll need to:

1. **Option A: Hardcode the token temporarily**
   - Replace `process.env.REACT_APP_VERCEL_ID || 'your-vercel-id-here'` with your actual token
   - Deploy
   - **Remember to remove the hardcoded token later!**

2. **Option B: Use a different deployment platform**
   - Consider Vercel for frontend too (supports environment variables)
   - Or Netlify (also supports environment variables)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your `.env` file** to version control
2. **The `.env` file is already in `.gitignore`**
3. **Your Vercel token gives access to your backend** - keep it secure
4. **Consider rotating tokens periodically**

## Troubleshooting

### 401 Still Appearing?
1. Verify your token is correct
2. Check that the `X-Vercel-Id` header is being sent
3. Ensure your backend is properly configured to read this header

### Token Not Working?
1. Regenerate your Vercel token
2. Check token scope and permissions
3. Verify the token hasn't expired

## Example Request

Here's what a properly authenticated request looks like:

```javascript
fetch('https://your-backend.vercel.app/default-key', {
  headers: {
    'X-Vercel-Id': 'your-vercel-token-here'
  }
})
```

## Next Steps

Once authentication is working:
1. Test all API endpoints
2. Deploy your frontend
3. Verify production functionality
4. Consider implementing token rotation for security
