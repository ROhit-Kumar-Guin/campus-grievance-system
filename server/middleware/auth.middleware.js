import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── protect ─────────────────────────────────────────────────
// Attach this to any route that requires login
// It reads the token from the Authorization header,
// verifies it, and attaches the user to req.user
export const protect = async (req, res, next) => {
  let token;

  // Tokens are sent in the Authorization header like:
  // Authorization: Bearer eyJhbGciOiJIUzI1...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    // Verify the token — this throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user (without password) to the request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    next(); // pass control to the actual route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
};

// ── adminOnly ────────────────────────────────────────────────
// Attach after protect — only lets Admins through
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied — admins only',
  });
};