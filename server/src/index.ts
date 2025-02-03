import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupWebSocketHandlers } from './websocket/handlers';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// API routes
app.use('/api', router);

// Set up WebSocket handlers
setupWebSocketHandlers(io);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 