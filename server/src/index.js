import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { redisClient, initRedis } from './redis.js';
import { setupSocketHandlers } from './socketHandler.js';
import * as runnerService from './runnerService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// REST API endpoints (fallback, primary is Socket.IO)
app.get('/api/state', async (req, res) => {
  try {
    const state = await runnerService.getState();
    res.json({ state, timestamp: Date.now() });
  } catch (err) {
    console.error('GET /api/state error:', err);
    res.status(500).json({ error: 'Failed to get state' });
  }
});

app.post('/api/add', async (req, res) => {
  try {
    const { name, actor } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const runner = await runnerService.addRunner(name.trim(), actor || 'api');
    io.emit('runner:added', runner);
    res.json({ runner });
  } catch (err) {
    console.error('POST /api/add error:', err);
    res.status(500).json({ error: 'Failed to add runner' });
  }
});

app.post('/api/move', async (req, res) => {
  try {
    const { id, to, actor } = req.body;
    if (!id || !to) {
      return res.status(400).json({ error: 'id and to are required' });
    }
    const result = await runnerService.moveRunner(id, to, actor || 'api');
    if (result.error) {
      return res.status(409).json(result);
    }
    io.emit('runner:moved', result);
    res.json(result);
  } catch (err) {
    console.error('POST /api/move error:', err);
    res.status(500).json({ error: 'Failed to move runner' });
  }
});

app.post('/api/remove/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pin, actor } = req.body;
    
    // Optional admin PIN protection
    if (process.env.ADMIN_PIN && pin !== process.env.ADMIN_PIN) {
      return res.status(403).json({ error: 'Invalid PIN' });
    }
    
    const result = await runnerService.removeRunner(id, actor || 'api');
    if (result.error) {
      return res.status(404).json(result);
    }
    io.emit('runner:removed', { id });
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/remove error:', err);
    res.status(500).json({ error: 'Failed to remove runner' });
  }
});

// Initialize and start
async function start() {
  try {
    // Initialize Redis
    await initRedis();
    console.log('✓ Redis connected');
    
    // Setup Socket.IO handlers
    setupSocketHandlers(io);
    console.log('✓ Socket.IO handlers configured');
    
    // Start server
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`   HTTP API: http://localhost:${PORT}/api/state`);
      console.log(`   Socket.IO: ws://localhost:${PORT}`);
      console.log(`\n   Ready for connections!\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠ Shutting down gracefully...');
  try {
    await redisClient.quit();
    httpServer.close(() => {
      console.log('✓ Server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

start();