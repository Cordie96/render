import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export function useWebSocketReconnect(socket: Socket | null) {
  const { user } = useAuth();

  const attemptReconnect = useCallback(() => {
    if (!socket || !user) return;
    
    socket.io.opts.extraHeaders = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    socket.connect();
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;

    const reconnectInterval = setInterval(() => {
      if (!socket.connected) {
        attemptReconnect();
      }
    }, 5000);

    return () => {
      clearInterval(reconnectInterval);
    };
  }, [socket, attemptReconnect]);

  return { attemptReconnect };
} 