import express from 'express';
import {
  getStories,
  createStory,
  toggleLike,
  addComment,
  deleteStory,
} from '../controllers/story.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { uploadStory } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect);

// Anyone logged in can view, like, comment
router.get('/',              getStories);
router.post('/:id/like',     toggleLike);
router.post('/:id/comments', addComment);

// Admin only
router.post(
  '/',
  uploadStory.single('image'),
  createStory
);
router.delete('/:id', adminOnly, deleteStory);

export default router;