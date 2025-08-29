# 🚀 Prompt Introspector - Complete Setup Guide

A real-time token-by-token AI reasoning visualizer with OpenAI integration via backend proxy.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## 🛠️ Setup Instructions

### Step 1: Create Project Structure

```bash
mkdir prompt-introspector
cd prompt-introspector
mkdir backend frontend
```

### Step 2: Setup Backend Server

```bash
cd backend

# Create package.json (copy the provided package.json content)
npm init -y

# Install dependencies
npm install express cors node-fetch dotenv

# Install dev dependencies
npm install -D nodemon

# Create server.js (copy the provided backend server code)
```

### Step 3: Setup Frontend

```bash
cd ../frontend

# Create React app
npx create-react-app .

# Install additional dependencies if needed
npm install

# Replace src/App.js with the provided React component code
```

### Step 4: Environment Configuration

Create `.env` file in backend directory:
```env
PORT=3001
NODE_ENV=development
```

### Step 5: Update Frontend Configuration

In `frontend/src/App.js`, ensure the backend URL is correctly set:
```javascript
const [backendUrl] = useState(() => 
  process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:3001'
);
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

The backend will start on `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## 🔧 How It Works

### Backend Proxy Server Features:
- **CORS Handling**: Eliminates browser CORS restrictions
- **API Key Management**: Securely handles OpenAI API keys
- **Streaming Support**: Real-time response streaming
- **Error Handling**: Comprehensive error management
- **Session Management**: Temporary API key storage per session

### Frontend Features:
- **Token Visualization**: Real-time token-by-token processing
- **AI Reasoning**: Step-by-step analysis display  
- **Streaming Responses**: Live AI response generation
- **Interactive UI**: Clean, professional interface

## 📡 API Endpoints

### Backend Endpoints:
- `POST /api/set-key` - Store API key for session
- `POST /api/chat/completions` - OpenAI proxy with streaming
- `POST /api/validate-key` - Validate API key
- `GET /api/models` - List available models
- `GET /api/health` - Health check

## 🔒 Security Features

- API keys stored temporarily per session
- No persistent storage of sensitive data
- CORS protection
- Input validation
- Error handling without exposing sensitive info

## 📝 Usage Instructions

1. **Start both servers** (backend on 3001, frontend on 3000)
2. **Enter your OpenAI API key** in the frontend
3. **Type any prompt** you want to analyze
4. **Click "Analyze with OpenAI"**
5. **Watch the magic happen**:
   - See tokens get processed one by one
   - Read AI reasoning for each token
   - Watch live response streaming
   - Get complete final response

## 🎯 Example Prompts to Try

- "Explain why the sky is blue"
- "How does photosynthesis work?"
- "What is artificial intelligence?"
- "Describe quantum computing"
- "How do neural networks learn?"

## 🔧 Production Deployment

### Backend Deployment:
- Deploy to services like Heroku, Railway, or Vercel
- Set environment variables for production
- Use proper session management (Redis, etc.)
- Add rate limiting and authentication

### Frontend Deployment:
- Build: `npm run build`
- Deploy to Netlify, Vercel, or serve with backend
- Update backend URL for production

## 🐛 Troubleshooting

### Common Issues:

**Backend not starting:**
- Check if port 3001 is available
- Verify all dependencies are installed
- Check Node.js version (needs v16+)

**Frontend can't connect:**
- Ensure backend is running on port 3001
- Check console for network errors
- Verify CORS is properly configured

**API key issues:**
- Ensure API key starts with "sk-"
- Check OpenAI account has credits
- Verify API key permissions

**Streaming issues:**
- Check network connectivity
- Verify backend streaming implementation
- Test with non-streaming first

**Token analysis not working:**
- Check if prompt is properly tokenized
- Verify reasoning generation logic
- Test with simple prompts first

## 🚀 Advanced Features

### Custom Model Selection:
Add model selection to frontend:
```javascript
const models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
```

### Enhanced Token Analysis:
- Add attention visualization
- Include confidence scores
- Show processing time per token

### Response Analysis:
- Word count and reading time
- Sentiment analysis
- Topic extraction

## 📊 Performance Optimization

### Backend Optimizations:
- Implement connection pooling
- Add request caching
- Use compression middleware
- Add rate limiting

### Frontend Optimizations:
- Lazy load components
- Optimize re-renders
- Add loading states
- Implement error boundaries

## 🔍 Monitoring & Logging

### Backend Logging:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Analytics Integration:
- Track token processing times
- Monitor API usage
- Log error rates
- User interaction metrics

## 🧪 Testing

### Backend Tests:
```javascript
// __tests__/server.test.js
const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  test('Health check', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  test('API key validation', async () => {
    const response = await request(app)
      .post('/api/validate-key')
      .send({ apiKey: 'invalid-key' });
    expect(response.status).toBe(400);
  });
});
```

### Frontend Tests:
```javascript
// src/__tests__/App.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

test('renders prompt input', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/enter a prompt/i);
  expect(inputElement).toBeInTheDocument();
});
```

## 🎨 Customization Options

### UI Theming:
```javascript
const themes = {
  light: {
    background: '#ffffff',
    text: '#000000',
    accent: '#2563eb'
  },
  dark: {
    background: '#1a1a1a',
    text: '#ffffff',
    accent: '#60a5fa'
  }
};
```

### Token Visualization Styles:
- Different colors for token types
- Animation effects
- Size variations based on importance
- Hover effects for detailed info

## 🌟 Feature Extensions

### Real-time Collaboration:
- WebSocket integration
- Shared analysis sessions
- Multi-user token analysis

### Data Export:
- Export analysis results
- Save reasoning chains
- Download response data

### Integration Options:
- Webhook support for external systems
- API for third-party integrations
- Plugin architecture

## 📱 Mobile Optimization

### Responsive Design:
```css
@media (max-width: 768px) {
  .token-visualization {
    font-size: 12px;
    padding: 8px;
  }
  
  .reasoning-panel {
    max-height: 300px;
    overflow-y: auto;
  }
}
```

### Touch Interactions:
- Swipe gestures for navigation
- Touch-friendly token selection
- Mobile-optimized layouts

## 🔐 Security Best Practices

### API Key Protection:
- Server-side key storage only
- Encrypted key transmission
- Key rotation support
- Usage monitoring

### Input Sanitization:
```javascript
const sanitizeInput = (input) => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .slice(0, 4000); // Limit length
};
```

### Rate Limiting:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## 📈 Scaling Considerations

### Horizontal Scaling:
- Load balancer configuration
- Session store (Redis)
- Database for persistent data
- CDN for static assets

### Performance Monitoring:
- Response time tracking
- Memory usage monitoring
- Error rate alerts
- API quota management

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Error logging implemented
- [ ] Rate limiting active
- [ ] Health checks working
- [ ] Monitoring dashboard setup
- [ ] Backup strategy in place
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] API documentation complete

## 🆘 Support & Resources

### Documentation:
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev)

### Community:
- GitHub Issues for bug reports
- Discord community for discussions
- Stack Overflow for technical questions

### Professional Support:
- Enterprise deployment assistance
- Custom feature development
- Performance optimization consulting

## 🏆 Success Metrics

Track these KPIs to measure success:
- Response time < 2 seconds
- Uptime > 99.9%
- Error rate < 1%
- User satisfaction > 4.5/5
- API cost efficiency

---

## 🎉 You're All Set!

Your Prompt Introspector is now ready for production use with real OpenAI integration, secure backend proxy, and comprehensive token analysis capabilities.

**Happy analyzing!** 🚀🔍✨