import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as roomController from '../controllers/roomController';
import * as queueController from '../controllers/queueController';
import * as youtubeController from '../controllers/youtubeController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth';

const router = Router();

// Auth routes
router.post('/auth/register', validate(registerSchema), authController.register);
router.post('/auth/login', validate(loginSchema), authController.login);

// Room routes
router.post('/rooms', auth, roomController.createRoom);
router.get('/rooms', auth, roomController.getRooms);
router.post('/rooms/:roomId/close', auth, roomController.closeRoom);
router.post('/rooms/:roomId/join', auth, roomController.joinRoom);

// Queue routes
router.post('/rooms/:roomId/queue', auth, queueController.addToQueue);
router.delete('/rooms/:roomId/queue/:itemId', auth, queueController.removeFromQueue);

// YouTube routes
router.get('/youtube/search', auth, youtubeController.searchVideos);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router; 