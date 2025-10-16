import * as runnerService from './runnerService.js';

/**
 * Setup Socket.IO event handlers
 */
export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);
    
    // Send current state to new client
    socket.on('request:state', async () => {
      try {
        const state = await runnerService.getState();
        socket.emit('state', { state, timestamp: Date.now() });
      } catch (err) {
        console.error('Error sending state:', err);
        socket.emit('error', { message: 'Failed to get state' });
      }
    });
    
    // Add runner
    socket.on('runner:add', async (data) => {
      try {
        const { name } = data;
        if (!name || !name.trim()) {
          socket.emit('error', { message: 'Name is required' });
          return;
        }
        
        const runner = await runnerService.addRunner(
          name.trim(),
          socket.id
        );
        
        // Broadcast to all clients including sender
        io.emit('runner:added', runner);
      } catch (err) {
        console.error('Error adding runner:', err);
        socket.emit('error', { message: 'Failed to add runner' });
      }
    });
    
    // Move runner
    socket.on('runner:move', async (data) => {
      try {
        const { id, to } = data;
        if (!id || !to) {
          socket.emit('error', { message: 'id and to are required' });
          return;
        }
        
        const result = await runnerService.moveRunner(id, to, socket.id);
        
        if (result.error) {
          // Send error back to client, trigger resync
          socket.emit('error', { message: result.error, resync: true });
          const state = await runnerService.getState();
          socket.emit('state', { state, timestamp: Date.now() });
          return;
        }
        
        // Broadcast to all clients
        io.emit('runner:moved', result);
      } catch (err) {
        console.error('Error moving runner:', err);
        socket.emit('error', { message: 'Failed to move runner' });
      }
    });
    
    // Remove runner
    socket.on('runner:remove', async (data) => {
      try {
        const { id, pin } = data;
        if (!id) {
          socket.emit('error', { message: 'id is required' });
          return;
        }
        
        // Check optional PIN
        if (process.env.ADMIN_PIN && pin !== process.env.ADMIN_PIN) {
          socket.emit('error', { message: 'Invalid PIN' });
          return;
        }
        
        const result = await runnerService.removeRunner(id, socket.id);
        
        if (result.error) {
          socket.emit('error', { message: result.error });
          return;
        }
        
        // Broadcast to all clients
        io.emit('runner:removed', { id });
      } catch (err) {
        console.error('Error removing runner:', err);
        socket.emit('error', { message: 'Failed to remove runner' });
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });
}