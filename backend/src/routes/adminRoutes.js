const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getAllAdminEvents,
  approveEvent,
  rejectEvent,
  deleteEventByAdmin,
  getPlatformAnalytics
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

// Admin routes require authentication and ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);

router.get('/events', getAllAdminEvents);
router.patch('/events/:id/approve', approveEvent);
router.patch('/events/:id/reject', rejectEvent);
router.delete('/events/:id', deleteEventByAdmin);

router.get('/analytics', getPlatformAnalytics);

module.exports = router;
