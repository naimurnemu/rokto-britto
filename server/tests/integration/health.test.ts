/**
 * INTEGRATION TEST: Express API Server & Health Check
 * 
 * LEARNING NOTE:
 * Integration tests verify that HTTP routes, Express middlewares, and JSON serialization
 * work together as an integrated system using `supertest`.
 * 
 * How it works:
 * - `supertest(app)` makes synthetic HTTP calls to your Express app instance.
 * - You assert HTTP status codes (200, 400, 404, etc.) and response JSON bodies.
 */

import request from 'supertest';
import app from '../../src/app';

describe('Integration Test: Server Health & Root Endpoints', () => {
  it('GET / -> should return 200 with welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Rokto Britto');
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/health -> should return 200 with system uptime & status OK', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('Rokto Britto API');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/non-existent-route -> should return 404', async () => {
    const res = await request(app).get('/api/unknown-route-1234');
    expect(res.status).toBe(404);
  });
});
