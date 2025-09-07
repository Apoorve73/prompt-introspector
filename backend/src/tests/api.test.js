import request from 'supertest';
import app from '../app.js';

describe('API Routes', () => {
    describe('GET /api/health', () => {
        it('should return health status', async() => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('environment');
            expect(response.body).toHaveProperty('sessions');
        });
    });

    describe('POST /api/validate-key', () => {
        it('should validate API key format', async() => {
            const response = await request(app)
                .post('/api/validate-key')
                .send({ apiKey: 'invalid-key' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should require API key', async() => {
            const response = await request(app)
                .post('/api/validate-key')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/set-key', () => {
        it('should require session ID', async() => {
            const response = await request(app)
                .post('/api/set-key')
                .send({ apiKey: 'sk-test12345678901234567890' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should validate API key format', async() => {
            const response = await request(app)
                .post('/api/set-key')
                .send({
                    apiKey: 'invalid-key',
                    sessionId: 'test-session-123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/tokenize', () => {
        it('should require text', async() => {
            const response = await request(app)
                .post('/api/tokenize')
                .set('X-Session-Id', 'test-session-123')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should require session ID', async() => {
            const response = await request(app)
                .post('/api/tokenize')
                .send({ text: 'test text' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for unknown routes', async() => {
            const response = await request(app)
                .get('/api/unknown-route')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Route not found');
            expect(response.body).toHaveProperty('availableEndpoints');
        });
    });
});