const ApiResponse = require('../utils/apiResponse');

/**
 * Validates request payload against a Zod schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errorMap = parsed.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return ApiResponse.error(res, 'Validation error in submitted data', 400, errorMap);
    }
    req.body = parsed.data;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Validation processing failed', 400);
  }
};

module.exports = { validate };
