const express = require('express');
const router = express.Router();
const {
  getOrganizerEvents,
  getOrganizerAnalytics,
  getOrganizerBookings
} = require('../controllers/organizerController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Organizer routes require authentication and ORGANIZER or ADMIN role
router.use(protect);
router.use(authorize('ORGANIZER', 'ADMIN'));

router.get('/events', getOrganizerEvents);
router.get('/analytics', getOrganizerAnalytics);
router.get('/bookings', getOrganizerBookings);

module.exports = router;
