import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import { securityHeaders } from './middleware/security.js';
import { requestLogger, errorLogger } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/api.js';
import sessionService from './services/sessionService.js';

// Create Express app
const app = express();

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(
  cors({
    origin: config.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'X-Vercel-Id'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware
app.use(requestLogger);

// API routes
app.use('/api', apiRoutes);

// Health check for load balancers
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorLogger);
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Graceful shutdown handler
const gracefulShutdown = signal => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

  // Clean up sessions
  const cleanedCount = sessionService.clearAllSessions();
  console.log(`🧹 Cleaned up ${cleanedCount} sessions`);

  // Stop cleanup interval
  sessionService.stopCleanup();

  console.log('✅ Graceful shutdown completed');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;
