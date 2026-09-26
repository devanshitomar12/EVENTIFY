const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { bookTicketsSchema, cancelBookingSchema } = require('../validators/bookingValidator');

// All booking routes require authentication
router.use(protect);

router.post('/', validate(bookTicketsSchema), createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', validate(cancelBookingSchema), cancelBooking);

module.exports = router;
