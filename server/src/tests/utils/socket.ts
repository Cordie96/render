import { io as Client, Socket } from 'socket.io-client';

export function createTestSocket(port: number, token: string) {
  return new Promise<Socket>((resolve, reject) => {
    const socket = Client(`http://localhost:${port}`, {
      auth: { token }
    });

    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);

    socket.connect();
  });
}

export function waitForSocketEvent(socket: Socket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
} 