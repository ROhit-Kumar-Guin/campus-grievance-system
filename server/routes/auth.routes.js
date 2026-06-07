import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes — no token needed
router.post('/register', register);
router.post('/login', login);

// Protected route — token required
router.get('/me', protect, getMe);

export default router;