import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

// Configure server URL - adjust for your environment
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let socket = null;

function useSocket() {
  const [runners, setRunners] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  useEffect(() => {
    // Initialize socket connection
    socket = io(SERVER_URL, {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ['websocket'],
      upgrade: false
    });
    
    // Connection handlers
    socket.on('connect', () => {
      console.log('✓ Connected to server');
      setConnectionStatus('connected');
      // Request current state
      socket.emit('request:state');
    });
    
    socket.on('disconnect', () => {
      console.log('✗ Disconnected from server');
      setConnectionStatus('disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('disconnected');
    });
    
    socket.on('reconnecting', () => {
      console.log('⟳ Reconnecting...');
      setConnectionStatus('connecting');
    });
    
    // State handlers
    socket.on('state', (data) => {
      console.log('Received state:', data);
      setRunners(data.state.runners || {});
    });
    
    socket.on('runner:added', (runner) => {
      console.log('Runner added:', runner);
      setRunners(prev => ({
        ...prev,
        [runner.id]: runner
      }));
    });
    
    socket.on('runner:moved', (data) => {
      console.log('Runner moved:', data);
      setRunners(prev => ({
        ...prev,
        [data.runner.id]: data.runner
      }));
    });
    
    socket.on('runner:removed', (data) => {
      console.log('Runner removed:', data);
      setRunners(prev => {
        const newRunners = { ...prev };
        delete newRunners[data.id];
        return newRunners;
      });
    });
    
    socket.on('runner:allRemoved', (data) => {
      console.log('All done runners removed:', data);
      setRunners(prev => {
        const newRunners = { ...prev };
        data.ids.forEach(id => {
          delete newRunners[id];
        });
        return newRunners;
      });
    });
    
    socket.on('error', (error) => {
      console.error('Server error:', error);
      if (error.resync) {
        // Request fresh state on error
        socket.emit('request:state');
      }
    });
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  
  const addRunner = useCallback((name) => {
    if (socket && socket.connected) {
      socket.emit('runner:add', { name });
    }
  }, []);
  
  const moveRunner = useCallback((id, to) => {
    if (socket && socket.connected) {
      socket.emit('runner:move', { id, to });
    }
  }, []);
  
  const removeRunner = useCallback((id, pin) => {
    if (socket && socket.connected) {
      socket.emit('runner:remove', { id, pin });
    }
  }, []);
  
  const removeAllRunners = useCallback((pin) => {
    if (socket && socket.connected) {
      socket.emit('runner:removeAll', { pin });
    }
  }, []);
  
  return {
    runners,
    connectionStatus,
    addRunner,
    moveRunner,
    removeRunner,
    removeAllRunners
  };
}

export default useSocket;