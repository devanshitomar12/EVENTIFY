const ApiResponse = require('../utils/apiResponse');

/**
 * Role-Based Access Control (RBAC) middleware
 * e.g. authorize('ORGANIZER', 'ADMIN')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required before checking permissions.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required roles: ${roles.join(', ')}`,
        403
      );
    }

    next();
  };
};

module.exports = { authorize };
