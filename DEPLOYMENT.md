# Deployment Guide

## Overview
This project consists of two parts:
- **Frontend**: React application (can be deployed to GitHub Pages)
- **Backend**: Express.js server (needs to be deployed to a hosting service)

## Frontend Deployment (GitHub Pages)

### 1. Build and Deploy
```bash
cd frontend
npm run deploy
```

This will:
- Build the production version of your React app
- Deploy it to the `gh-pages` branch
- Make it available at: `https://apoorve73.github.io/prompt-introspector`

### 2. Enable GitHub Pages
1. Go to your GitHub repository
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Set source to "Deploy from a branch"
5. Select `gh-pages` branch and `/ (root)` folder
6. Click "Save"

## Backend Deployment

Since your backend needs to run as a server, you'll need to deploy it to a hosting service. Here are some options:

### Option 1: Heroku (Recommended for beginners)
1. Create a Heroku account
2. Install Heroku CLI
3. Deploy using:
```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Option 2: Vercel
1. Create a Vercel account
2. Connect your GitHub repository
3. Set build settings for the backend folder

### Option 3: Railway
1. Create a Railway account
2. Connect your GitHub repository
3. Deploy the backend folder

## Configuration

### Frontend Configuration
Update `frontend/src/config.js` with your backend URL:
```javascript
production: {
  apiBaseUrl: 'https://your-backend-url.com/api',
}
```

### Environment Variables
Set these in your backend hosting service:
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Port number (usually set automatically)

## Testing Deployment

1. **Frontend**: Visit `https://apoorve73.github.io/prompt-introspector`
2. **Backend**: Test your API endpoints
3. **Integration**: Ensure frontend can communicate with backend

## Troubleshooting

### Common Issues:
- **CORS errors**: Ensure backend allows requests from GitHub Pages domain
- **API key issues**: Check environment variables in backend hosting
- **Build failures**: Check for syntax errors in React code

### CORS Configuration
Your backend already includes CORS middleware, but you may need to update it for production:
```javascript
app.use(cors({
  origin: ['https://apoorve73.github.io', 'http://localhost:3000']
}));
```

## Next Steps
1. Deploy backend to your chosen hosting service
2. Update the production API URL in `frontend/src/config.js`
3. Deploy frontend to GitHub Pages
4. Test the complete application
