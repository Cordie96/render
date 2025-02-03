import { Socket } from 'socket.io-client';

type EventHandler<T = any> = (data: T) => void;
type EventMap = Record<string, EventHandler>;

export function setupSocketEvents<T extends EventMap>(
  socket: Socket | null,
  events: T
) {
  if (!socket) return;

  // Subscribe to events
  Object.entries(events).forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  // Return cleanup function
  return () => {
    Object.keys(events).forEach((event) => {
      socket.off(event);
    });
  };
}

export function emitSocketEvent<T = any>(
  socket: Socket | null,
  event: string,
  data?: T
) {
  if (!socket) return;
  socket.emit(event, data);
} 