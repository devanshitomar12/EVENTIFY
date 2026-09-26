const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized to access this resource. Please log in.', 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'eventify_super_secret_jwt_key_2026'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return ApiResponse.error(res, 'User belonging to this token no longer exists.', 401);
    }

    if (user.status === 'SUSPENDED') {
      return ApiResponse.error(res, 'Your account has been suspended. Please contact platform support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return ApiResponse.error(res, 'Invalid or expired authentication token. Please log in again.', 401);
  }
};

module.exports = { protect };
