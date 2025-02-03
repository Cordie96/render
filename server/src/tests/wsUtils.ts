import { io as Client } from 'socket.io-client';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';

export const createTestServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer);
  return { io, httpServer };
};

export const createTestClient = (port: number, auth: { token: string }) => {
  return Client(`http://localhost:${port}`, {
    auth,
    autoConnect: false,
  });
};

export const waitFor = (socket: any, event: string) => {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}; 