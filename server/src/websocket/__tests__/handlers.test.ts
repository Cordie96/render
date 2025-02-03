import { createTestServer, createTestClient, waitFor } from '../../tests/wsUtils';
import { createTestUser, createTestRoom } from '../../tests/setup';
import { setupWebSocketHandlers } from '../handlers';

describe('WebSocket Handlers', () => {
  let io: any;
  let clientSocket: any;
  let httpServer: any;
  let user: any;
  let token: string;
  let room: any;

  beforeAll(async () => {
    const testData = await createTestUser();
    user = testData.user;
    token = testData.token;
  });

  beforeEach(async () => {
    const server = createTestServer();
    io = server.io;
    httpServer = server.httpServer;

    setupWebSocketHandlers(io);

    const port = await new Promise<number>((resolve) => {
      httpServer.listen(() => {
        resolve((httpServer.address() as AddressInfo).port);
      });
    });

    clientSocket = createTestClient(port, { token });
    room = await createTestRoom(user.id);
  });

  afterEach(() => {
    io.close();
    clientSocket.close();
  });

  it('authenticates socket connection', (done) => {
    clientSocket.connect();
    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });
  });

  it('handles room joining', async () => {
    clientSocket.connect();
    await waitFor(clientSocket, 'connect');

    clientSocket.emit('join-room', room.id);
    await waitFor(clientSocket, 'joined-room');

    const participants = await prisma.roomParticipant.findMany({
      where: { roomId: room.id },
    });
    expect(participants).toHaveLength(1);
  });

  it('handles player commands', async () => {
    clientSocket.connect();
    await waitFor(clientSocket, 'connect');

    const secondClient = createTestClient(
      (httpServer.address() as AddressInfo).port,
      { token }
    );
    secondClient.connect();

    clientSocket.emit('join-room', room.id);
    secondClient.emit('join-room', room.id);

    await waitFor(clientSocket, 'joined-room');
    await waitFor(secondClient, 'joined-room');

    return new Promise<void>((resolve) => {
      secondClient.on('player-command', (command: string) => {
        expect(command).toBe('play');
        secondClient.close();
        resolve();
      });

      clientSocket.emit('player-command', { roomId: room.id, command: 'play' });
    });
  });
}); 