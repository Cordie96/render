import { useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../hooks/useError';

export function useSocketConnection() {
  const { socket, connected } = useSocket();
  const { token } = useAuth();
  const { handleError } = useError();

  const connect = useCallback(() => {
    if (!socket || !token) return;
    socket.auth = { token };
    socket.connect();
  }, [socket, token]);

  const disconnect = useCallback(() => {
    socket?.disconnect();
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleError = (error: Error) => {
      handleError(error);
    };

    socket.on('connect_error', handleError);

    return () => {
      socket.off('connect_error', handleError);
    };
  }, [socket, handleError]);

  return {
    connected,
    connect,
    disconnect,
  };
} 