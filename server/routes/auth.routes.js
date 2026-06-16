import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  deleteAccount,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import User from '../models/User.js';

const router = express.Router();

// Public
router.post('/register',        register);
router.post('/login',           login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

// Protected — any logged in user
router.get('/me',                protect, getMe);
router.patch('/update-profile',  protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

// Get all admins — any logged in user can see this
router.get('/admins', protect, async (req, res) => {
  try {
    const admins = await User.find({ role: 'Admin' })
      .select('name email department');
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin only
router.get('/users',         protect, adminOnly, getAllUsers);
router.delete('/users/:id',  protect, adminOnly, deleteUser);

export default router;