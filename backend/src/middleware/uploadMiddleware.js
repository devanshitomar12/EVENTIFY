const multer = require('multer');
const ApiResponse = require('../utils/apiResponse');

// Use memory storage to process buffers with Cloudinary / Data URI
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max limit
  },
  fileFilter
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.error(res, 'Uploaded image exceeds the 5MB size limit.', 400);
    }
    return ApiResponse.error(res, `Upload error: ${err.message}`, 400);
  } else if (err) {
    return ApiResponse.error(res, err.message, 400);
  }
  next();
};

module.exports = {
  upload,
  handleMulterError
};
