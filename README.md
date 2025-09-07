# 🔍 Prompt Introspector

A real-time token analysis tool that provides insights into how OpenAI's GPT models process and understand text input. Built with modern React and Node.js best practices.

## ✨ Features

- **Real-time Token Analysis**: Visualize how GPT models tokenize and process text
- **Temperature Comparison**: Compare responses across different creativity levels
- **Secure Backend Proxy**: API keys are handled securely through a backend proxy
- **Modern UI**: Clean, responsive interface with accessibility features
- **Error Handling**: Comprehensive error boundaries and validation
- **Performance Optimized**: Efficient state management and API calls

## 🏗️ Architecture

### Backend (`/backend`)
- **Express.js** server with modular architecture
- **Security middleware** (rate limiting, validation, CORS)
- **Session management** for API key storage
- **Comprehensive logging** and error handling
- **OpenAI API integration** with proper error handling

### Frontend (`/frontend`)
- **React 18** with modern hooks and patterns
- **CSS Custom Properties** for consistent theming
- **Error boundaries** for graceful error handling
- **Custom hooks** for API management
- **Accessibility features** (ARIA labels, keyboard navigation)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- OpenAI API key (optional - can use environment variable)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prompt-introspector.git
   cd prompt-introspector
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cd ../backend
   cp env.example .env
   # Edit .env and add your OpenAI API key (optional)
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🔧 Development

### Backend Development

```bash
cd backend

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend Development

```bash
cd frontend

# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Lint code
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
prompt-introspector/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── tests/           # Test files
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # App entry point
│   ├── public/              # Static assets
│   └── package.json
└── README.md
```

## 🔒 Security Features

- **API Key Validation**: Proper format and length validation
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive request validation
- **Security Headers**: XSS protection, content type sniffing prevention
- **Session Management**: Secure API key storage with expiration

## 🧪 Testing

### Backend Tests
- API endpoint testing with Supertest
- Service layer unit tests
- Middleware testing
- Error handling validation

### Frontend Tests
- Component testing with React Testing Library
- Hook testing
- Integration tests
- Accessibility testing

## 📊 Performance

- **Code Splitting**: Lazy loading of components
- **Memoization**: Optimized re-renders with useMemo and useCallback
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Efficient API response caching
- **Compression**: Gzip compression for production

## 🌐 Deployment

### Backend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Frontend Deployment (GitHub Pages)
```bash
cd frontend
npm run deploy
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
LOG_LEVEL=info
```

**Frontend**
- Automatically detects environment (development/production)
- Uses different API endpoints based on environment

## 📝 API Documentation

### Endpoints

- `GET /api/health` - Health check
- `POST /api/set-key` - Set API key for session
- `POST /api/validate-key` - Validate API key
- `POST /api/tokenize` - Tokenize text
- `GET /api/models` - Get available OpenAI models
- `POST /api/chat/completions` - Chat completion with streaming
- `GET /api/default-key` - Check for default API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the GPT API
- React team for the amazing framework
- Express.js for the robust backend framework
- All contributors and users

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/prompt-introspector/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ by the Prompt Introspector team**