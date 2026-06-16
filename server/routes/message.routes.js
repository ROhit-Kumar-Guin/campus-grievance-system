import express from 'express';
import { getMessages, sendMessage, getInbox } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// inbox MUST be before /:grievanceId
// otherwise Express matches 'inbox' as a grievanceId
router.get('/inbox', getInbox);
router.get('/:grievanceId', getMessages);
router.post('/:grievanceId', sendMessage);

export default router;