import config from '../config/index.js';
import { logger } from '../middleware/logging.js';

class SessionService {
    constructor() {
        this.sessions = new Map();
        this.cleanupInterval = null;
        this.startCleanup();
    }

    // Set API key for session
    setApiKey(sessionId, apiKey) {
        const session = {
            apiKey,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
        };

        this.sessions.set(sessionId, session);
        logger.debug('API key set for session', { sessionId });
    }

    // Get API key for session
    getApiKey(sessionId) {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return null;
        }

        // Update last accessed time
        session.lastAccessed = Date.now();

        return session.apiKey;
    }

    // Check if session exists
    hasSession(sessionId) {
        return this.sessions.has(sessionId);
    }

    // Remove session
    removeSession(sessionId) {
        const removed = this.sessions.delete(sessionId);
        if (removed) {
            logger.debug('Session removed', { sessionId });
        }
        return removed;
    }

    // Get session info
    getSessionInfo(sessionId) {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return null;
        }

        return {
            createdAt: session.createdAt,
            lastAccessed: session.lastAccessed,
            age: Date.now() - session.createdAt,
            idleTime: Date.now() - session.lastAccessed,
        };
    }

    // Get all sessions info
    getAllSessionsInfo() {
        const sessionsInfo = [];

        for (const [sessionId, session] of this.sessions) {
            sessionsInfo.push({
                sessionId,
                createdAt: session.createdAt,
                lastAccessed: session.lastAccessed,
                age: Date.now() - session.createdAt,
                idleTime: Date.now() - session.lastAccessed,
            });
        }

        return sessionsInfo;
    }

    // Clean up expired sessions
    cleanupExpiredSessions() {
        const now = Date.now();
        const expiredSessions = [];

        for (const [sessionId, session] of this.sessions) {
            const age = now - session.createdAt;
            const idleTime = now - session.lastAccessed;

            // Remove sessions older than timeout or idle for too long
            if (age > config.security.sessionTimeout || idleTime > config.security.sessionTimeout) {
                expiredSessions.push(sessionId);
            }
        }

        expiredSessions.forEach(sessionId => {
            this.sessions.delete(sessionId);
        });

        if (expiredSessions.length > 0) {
            logger.info('Cleaned up expired sessions', {
                count: expiredSessions.length,
                remaining: this.sessions.size
            });
        }

        return expiredSessions.length;
    }

    // Start automatic cleanup
    startCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Clean up every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000);

        logger.info('Session cleanup started');
    }

    // Stop automatic cleanup
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            logger.info('Session cleanup stopped');
        }
    }

    // Clear all sessions
    clearAllSessions() {
        const count = this.sessions.size;
        this.sessions.clear();
        logger.info('All sessions cleared', { count });
        return count;
    }

    // Get statistics
    getStats() {
        return {
            totalSessions: this.sessions.size,
            activeSessions: Array.from(this.sessions.values()).filter(
                session => Date.now() - session.lastAccessed < config.security.sessionTimeout
            ).length,
        };
    }
}

export default new SessionService();