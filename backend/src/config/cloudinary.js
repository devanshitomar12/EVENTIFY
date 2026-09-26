const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  logger.info('Cloudinary configured with environment credentials.');
} else {
  logger.warn('Cloudinary environment credentials not detected. Image uploads will use base64 data URIs as fallback.');
}

/**
 * Uploads a file buffer or path to Cloudinary, with graceful fallback to Base64 Data URI
 */
const uploadToCloudinary = async (fileBuffer, mimeType, folder = 'eventify') => {
  if (isConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Graceful fallback to Data URI
  const base64 = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;
  return {
    url: dataUri,
    publicId: `local_${Date.now()}`
  };
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadToCloudinary
};
