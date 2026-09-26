const crypto = require('crypto');

/**
 * Generates a unique, professional Booking Reference ID
 * Format: EVT-YYYY-XXXXXX (e.g. EVT-2026-8F42KD)
 */
const generateBookingId = () => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EVT-${year}-${randomHex}`;
};

module.exports = {
  generateBookingId
};
