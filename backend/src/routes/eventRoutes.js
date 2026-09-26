const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  getRelatedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadBanner
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { createEventSchema, updateEventSchema } = require('../validators/eventValidator');

// Public endpoints
router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/related', getRelatedEvents);

// Protected endpoints (Organizer, Admin)
router.post(
  '/',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  validate(createEventSchema),
  createEvent
);

router.put(
  '/:id',
  protect,
  authorize('ORGANIZER', 'ADMIN'),
  validate(updateEventSchema),
  updateEvent
);

router.delete('/:id', protect, authorize('ORGANIZER', 'ADMIN'), deleteEvent);

// Image banner upload
router.post(
  '/upload-banner',
  protect,
  upload.single('banner'),
  handleMulterError,
  uploadBanner
);

module.exports = router;
