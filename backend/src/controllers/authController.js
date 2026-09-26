const crypto = require('crypto');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { sendPasswordResetEmail } = require('../services/emailService');

// Helper to format user response without sensitive fields
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    phone: user.phone,
    createdAt: user.createdAt
  };

  return ApiResponse.success(res, { user: userData, token }, message, statusCode);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return ApiResponse.error(res, 'An account with this email already exists', 400);
    }

    // Default to USER if someone tries to pass ADMIN
    const assignedRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || ''
    });

    return sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    if (user.status === 'SUSPENDED') {
      return ApiResponse.error(res, 'Your account has been suspended. Please contact support.', 403);
    }

    return sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear token
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  return ApiResponse.success(res, null, 'Logged out successfully');
};

/**
 * @desc    Get currently logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const userData = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    profileImage: req.user.profileImage,
    phone: req.user.phone,
    createdAt: req.user.createdAt
  };
  return ApiResponse.success(res, userData, 'User profile fetched');
};

/**
 * @desc    Update profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (profileImage !== undefined) fieldsToUpdate.profileImage = profileImage;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    const userData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      phone: updatedUser.phone,
      createdAt: updatedUser.createdAt
    };

    return ApiResponse.success(res, userData, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.error(res, 'Current password does not match', 400);
    }

    user.password = newPassword;
    await user.save();

    return ApiResponse.success(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - generate reset token & email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak if email exists or not
      return ApiResponse.success(
        res,
        null,
        'If an account exists with that email, a password reset link has been dispatched.'
      );
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail({ user, resetUrl });

    return ApiResponse.success(
      res,
      { resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined },
      'If an account exists with that email, a password reset link has been dispatched.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password/:resetToken
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now()}
    });

    if (!user) {
      return ApiResponse.error(res, 'Invalid or expired password reset token', 400);
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendTokenResponse(user, 200, res, 'Password reset successful. You are now logged in.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
