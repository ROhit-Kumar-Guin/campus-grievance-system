import express from 'express';
import {
  getResources,
  uploadResource,
  trackDownload,
  deleteResource,
} from '../controllers/resource.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { uploadResource as uploadMiddleware } from '../config/cloudinary.js';

const router = express.Router();

// All routes require login
router.use(protect);

// Anyone logged in can view and download
router.get('/', getResources);
router.patch('/:id/download', trackDownload);

// Admin only — upload and delete
router.post(
  '/',
  adminOnly,
  uploadMiddleware.single('file'), // 'file' must match the field name in the form
  uploadResource
);
router.delete('/:id', adminOnly, deleteResource);

export default router;