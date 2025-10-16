import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock Redis and service
jest.unstable_mockModule('../src/redis.js', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    lpush: jest.fn(),
    ltrim: jest.fn(),
    quit: jest.fn(),
  },
  initRedis: jest.fn().mockResolvedValue(undefined),
  KEYS: {
    STATE: 'runners:state',
    EVENTS: 'runners:events'
  }
}));

const { redisClient } = await import('../src/redis.js');

describe('API Endpoints', () => {
  let app;
  
  beforeAll(async () => {
    // Setup minimal Express app for testing
    app = express();
    app.use(express.json());
    
    const runnerService = await import('../src/runnerService.js');
    
    app.get('/api/state', async (req, res) => {
      const state = await runnerService.getState();
      res.json({ state, timestamp: Date.now() });
    });
    
    app.post('/api/add', async (req, res) => {
      const { name, actor } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const runner = await runnerService.addRunner(name.trim(), actor || 'test');
      res.json({ runner });
    });
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/state', () => {
    it('should return empty state when no runners exist', async () => {
      redisClient.get.mockResolvedValue(null);
      
      const response = await request(app).get('/api/state');
      
      expect(response.status).toBe(200);
      expect(response.body.state).toEqual({ runners: {} });
    });
    
    it('should return existing state', async () => {
      const mockState = {
        runners: {
          '123': { id: '123', name: 'Alice', status: 'warming' }
        }
      };
      redisClient.get.mockResolvedValue(JSON.stringify(mockState));
      
      const response = await request(app).get('/api/state');
      
      expect(response.status).toBe(200);
      expect(response.body.state).toEqual(mockState);
    });
  });
  
  describe('POST /api/add', () => {
    it('should add a new runner', async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ runners: {} }));
      redisClient.set.mockResolvedValue('OK');
      redisClient.lpush.mockResolvedValue(1);
      redisClient.ltrim.mockResolvedValue('OK');
      
      const response = await request(app)
        .post('/api/add')
        .send({ name: 'Bob' });
      
      expect(response.status).toBe(200);
      expect(response.body.runner).toMatchObject({
        name: 'Bob',
        status: 'warming'
      });
      expect(response.body.runner.id).toBeDefined();
      expect(response.body.runner.start_ts).toBeDefined();
    });
    
    it('should reject empty name', async () => {
      const response = await request(app)
        .post('/api/add')
        .send({ name: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name is required');
    });
    
    it('should trim whitespace from name', async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ runners: {} }));
      redisClient.set.mockResolvedValue('OK');
      redisClient.lpush.mockResolvedValue(1);
      redisClient.ltrim.mockResolvedValue('OK');
      
      const response = await request(app)
        .post('/api/add')
        .send({ name: '  Charlie  ' });
      
      expect(response.status).toBe(200);
      expect(response.body.runner.name).toBe('Charlie');
    });
  });
});