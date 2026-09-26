const QRCode = require('qrcode');
const logger = require('../utils/logger');

/**
 * Generate QR code data URI for a booking
 */
const generateBookingQRCode = async (payload) => {
  try {
    const stringData = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const qrDataUri = await QRCode.toDataURL(stringData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      width: 320
    });
    return qrDataUri;
  } catch (error) {
    logger.error('QR code generation failed:', error.message);
    throw new Error('Failed to generate ticket QR code');
  }
};

module.exports = {
  generateBookingQRCode
};
