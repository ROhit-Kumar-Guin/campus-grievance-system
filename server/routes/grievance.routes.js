import express from 'express';
import {
  getGrievances,
  getGrievanceById,
  createGrievance,
  updateStatus,
  assignGrievance,
  addComment,
  deleteGrievance,
} from '../controllers/grievance.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// All grievance routes require login
router.use(protect);

router.get('/',    getGrievances);
router.post('/',   createGrievance);
router.get('/:id', getGrievanceById);

// Comment on a grievance (student + admin)
router.post('/:id/comments', addComment);

// Admin only actions
router.patch('/:id/status', adminOnly, updateStatus);
router.patch('/:id/assign', adminOnly, assignGrievance);
router.delete('/:id',       adminOnly, deleteGrievance);

export default router;