import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, rollNumber, adminKey } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password and department',
      });
    }

    // ── Admin registration guard ─────────────────────────────
    // If someone tries to register as Admin, verify the secret key
if (role === 'Admin') {
  
  if (!adminKey) {
    return res.status(403).json({
      success: false,
      message: 'Admin secret key is required to register as Admin',
    });
  }
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Invalid admin secret key',
    });
  }
}

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'Student',
      department,
      rollNumber: rollNumber || '',
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log('REGISTER ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log('LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── UPDATE PROFILE ───────────────────────────────────────────
// PATCH /api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, department, rollNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, rollNumber },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CHANGE PASSWORD ──────────────────────────────────────────
// PATCH /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook hashes the new password

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL USERS (Admin only) ───────────────────────────────
// GET /api/auth/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE USER (Admin only) ─────────────────────────────────
// DELETE /api/auth/users/:id
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE OWN ACCOUNT ───────────────────────────────────────
// DELETE /api/auth/delete-account
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── FORGOT PASSWORD — Send OTP ───────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists — security best practice
      return res.status(200).json({
        success: true,
        message: 'If this email exists, an OTP has been sent',
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP and expiry on user document
    user.resetOTP       = otp;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email using nodemailer
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"CampusGrieve" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Your CampusGrieve OTP',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto">
          <h2 style="color:#4F46E5">CampusGrieve</h2>
          <p>Your OTP for password reset is:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#4F46E5;padding:16px;background:#EEF2FF;border-radius:8px;text-align:center">
            ${otp}
          </div>
          <p style="color:#666;font-size:13px">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── VERIFY OTP + RESET PASSWORD ──────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetOTP:       otp,
      resetOTPExpiry: { $gt: new Date() },
    });

    if (!user) {
      // Check if the OTP exists but attempts are exceeded
      const userWithOTP = await User.findOne({ email, resetOTP: { $exists: true } });
      if (userWithOTP) {
        userWithOTP.resetOTPAttempts = (userWithOTP.resetOTPAttempts || 0) + 1;

        if (userWithOTP.resetOTPAttempts >= 5) {
          userWithOTP.resetOTP           = undefined;
          userWithOTP.resetOTPExpiry     = undefined;
          userWithOTP.resetOTPAttempts   = 0;
          await userWithOTP.save();
          return res.status(400).json({
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.',
          });
        }
        await userWithOTP.save();
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Valid OTP — reset password
    user.password           = newPassword;
    user.resetOTP           = undefined;
    user.resetOTPExpiry     = undefined;
    user.resetOTPAttempts   = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};