import express from 'express';
import {
  getSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getStatusDistribution,
} from '../controllers/analytics.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Summary available to all logged-in users
router.get('/summary',      getSummary);

// Detailed analytics — admin only
router.get('/trends',       adminOnly, getMonthlyTrends);
router.get('/categories',   adminOnly, getCategoryBreakdown);
router.get('/status',       adminOnly, getStatusDistribution);

export default router;