import app from './app.js';
import config from './config/index.js';
import { logger } from './middleware/logging.js';

// Start server
const server = app.listen(config.server.port, () => {
    logger.info('🚀 Server started', {
        port: config.server.port,
        environment: config.server.nodeEnv,
        corsOrigins: config.server.corsOrigins,
    });

    console.log(`🚀 Proxy server running on http://localhost:${config.server.port}`);
    console.log(`📡 OpenAI API proxy available at /api/chat/completions`);
    console.log(`🔑 Set API key at /api/set-key`);
    console.log(`❤️  Health check at /api/health`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.server.port} is already in use`);
        console.error(`❌ Port ${config.server.port} is already in use`);
    } else {
        logger.error('Server error', { error: error.message });
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

export default server;