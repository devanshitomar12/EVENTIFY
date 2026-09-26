const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all users with role filtering & search
 * @route   GET /api/admin/users
 * @access  Private (ADMIN)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && ['USER', 'ORGANIZER', 'ADMIN'].includes(role)) {
      query.role = role;
    }

    if (status && ['ACTIVE', 'SUSPENDED'].includes(status)) {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    return ApiResponse.success(res, users, 'Users retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (ADMIN)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ORGANIZER', 'ADMIN'].includes(role)) {
      return ApiResponse.error(res, 'Invalid role specified', 400);
    }

    // Prevent demoting self
    if (req.params.id === req.user._id.toString() && role !== 'ADMIN') {
      return ApiResponse.error(res, 'Cannot demote your own admin account', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, user, `User role changed to ${role}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user status (ACTIVE / SUSPENDED)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (ADMIN)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return ApiResponse.error(res, 'Invalid status specified', 400);
    }

    if (req.params.id === req.user._id.toString()) {
      return ApiResponse.error(res, 'Cannot suspend your own admin account', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    return ApiResponse.success(res, user, `User account ${status.toLowerCase()}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all events with admin moderation options
 * @route   GET /api/admin/events
 * @access  Private (ADMIN)
 */
const getAllAdminEvents = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { venue: regex }, { city: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Event.countDocuments(query)
    ]);

    return ApiResponse.success(res, events, 'Admin events list retrieved', 200, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve an event
 * @route   PATCH /api/admin/events/:id/approve
 * @access  Private (ADMIN)
 */
const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'APPROVED' },
      { new: true }
    ).populate('organizer', 'name email');

    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }

    return ApiResponse.success(res, event, 'Event approved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject an event
 * @route   PATCH /api/admin/events/:id/reject
 * @access  Private (ADMIN)
 */
const rejectEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: 'REJECTED' },
      { new: true }
    ).populate('organizer', 'name email');

    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }

    return ApiResponse.success(res, event, 'Event rejected');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete event by Admin
 * @route   DELETE /api/admin/events/:id
 * @access  Private (ADMIN)
 */
const deleteEventByAdmin = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }
    return ApiResponse.success(res, null, 'Event removed from platform');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Comprehensive platform-wide analytics for Admin Dashboard
 * @route   GET /api/admin/analytics
 * @access  Private (ADMIN)
 */
const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizers,
      totalEvents,
      approvedEvents,
      pendingEvents,
      allBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'ORGANIZER' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'APPROVED' }),
      Event.countDocuments({ status: 'PENDING' }),
      Booking.find({ status: { $ne: 'Cancelled' } }).populate('event', 'category')
    ]);

    const totalBookings = allBookings.length;
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Month maps for last 6 months
    const months = [];
    const revenueMap = {};
    const bookingMap = {};
    const userGrowthMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      months.push(mName);
      revenueMap[mName] = 0;
      bookingMap[mName] = 0;
      userGrowthMap[mName] = 0;
    }

    allBookings.forEach((b) => {
      const m = new Date(b.createdAt).toLocaleString('en-US', { month: 'short' });
      if (revenueMap[m] !== undefined) {
        revenueMap[m] += b.totalAmount;
        bookingMap[m] += 1;
      }
    });

    // Category distribution
    const categoryMap = {};
    const events = await Event.find().select('category');
    events.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat]
    }));

    const revenueTrends = months.map((month) => ({
      month,
      revenue: Math.round(revenueMap[month])
    }));

    const bookingGrowth = months.map((month) => ({
      month,
      bookings: bookingMap[month]
    }));

    return ApiResponse.success(
      res,
      {
        kpis: {
          totalUsers,
          totalOrganizers,
          totalEvents,
          approvedEvents,
          pendingEvents,
          totalBookings,
          totalRevenue: Math.round(totalRevenue * 100) / 100
        },
        charts: {
          revenueTrends,
          bookingGrowth,
          categoryDistribution
        }
      },
      'Platform analytics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getAllAdminEvents,
  approveEvent,
  rejectEvent,
  deleteEventByAdmin,
  getPlatformAnalytics
};
