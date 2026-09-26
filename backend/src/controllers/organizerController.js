const Event = require('../models/Event');
const Booking = require('../models/Booking');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all events created by the logged-in organizer
 * @route   GET /api/organizer/events
 * @access  Private (ORGANIZER, ADMIN)
 */
const getOrganizerEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    // Calculate revenue & sales for each event
    const eventIds = events.map((e) => e._id);
    const bookings = await Booking.find({
      event: { $in: eventIds },
      status: { $ne: 'Cancelled' }
    });

    const eventStatsMap = {};
    bookings.forEach((b) => {
      const eId = b.event.toString();
      if (!eventStatsMap[eId]) {
        eventStatsMap[eId] = { revenue: 0, ticketsSold: 0, bookingCount: 0 };
      }
      eventStatsMap[eId].revenue += b.totalAmount || 0;
      eventStatsMap[eId].bookingCount += 1;
      eventStatsMap[eId].ticketsSold += b.tickets.reduce((sum, t) => sum + t.quantity, 0);
    });

    const enrichedEvents = events.map((event) => ({
      ...event,
      stats: eventStatsMap[event._id.toString()] || { revenue: 0, ticketsSold: 0, bookingCount: 0 }
    }));

    return ApiResponse.success(res, enrichedEvents, 'Organizer events retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comprehensive organizer analytics for charts & KPI cards
 * @route   GET /api/organizer/analytics
 * @access  Private (ORGANIZER, ADMIN)
 */
const getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    // Fetch organizer's events
    const events = await Event.find({ organizer: organizerId });
    const eventIds = events.map((e) => e._id);

    // Fetch all active bookings for these events
    const bookings = await Booking.find({
      event: { $in: eventIds },
      status: { $ne: 'Cancelled' }
    }).populate('event', 'title category date');

    const totalEvents = events.length;
    const now = new Date();
    const upcomingEvents = events.filter((e) => new Date(e.date) >= now).length;

    let totalRevenue = 0;
    let totalTicketsSold = 0;
    const attendeeEmailSet = new Set();

    // Recharts Data Structures
    const revenueByMonthMap = {};
    const eventPerformance = [];
    const ticketTypeMap = {};
    const categoryMap = {};

    // Initialize recent months for clean chart presentation
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('en-US', { month: 'short' });
      revenueByMonthMap[monthKey] = 0;
    }

    // Process bookings
    bookings.forEach((booking) => {
      totalRevenue += booking.totalAmount;
      if (booking.attendeeDetails && booking.attendeeDetails.email) {
        attendeeEmailSet.add(booking.attendeeDetails.email);
      }

      // Group revenue by booking month
      const bookingMonth = new Date(booking.createdAt).toLocaleString('en-US', { month: 'short' });
      if (revenueByMonthMap[bookingMonth] !== undefined) {
        revenueByMonthMap[bookingMonth] += booking.totalAmount;
      } else {
        revenueByMonthMap[bookingMonth] = booking.totalAmount;
      }

      // Ticket breakdown
      booking.tickets.forEach((t) => {
        totalTicketsSold += t.quantity;
        ticketTypeMap[t.ticketType] = (ticketTypeMap[t.ticketType] || 0) + t.quantity;
      });
    });

    // Event performance
    events.forEach((evt) => {
      const evtBookings = bookings.filter((b) => b.event._id.toString() === evt._id.toString());
      const evtRevenue = evtBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const evtTickets = evtBookings.reduce(
        (sum, b) => sum + b.tickets.reduce((s, t) => s + t.quantity, 0),
        0
      );

      categoryMap[evt.category] = (categoryMap[evt.category] || 0) + 1;

      eventPerformance.push({
        name: evt.title.length > 20 ? evt.title.substring(0, 18) + '...' : evt.title,
        fullTitle: evt.title,
        ticketsSold: evtTickets,
        revenue: evtRevenue,
        capacity: evt.ticketTypes.reduce((acc, t) => acc + t.quantity, 0)
      });
    });

    // Convert dictionaries to Recharts-ready arrays
    const revenueOverTime = Object.keys(revenueByMonthMap).map((month) => ({
      month,
      revenue: Math.round(revenueByMonthMap[month])
    }));

    const ticketDistribution = Object.keys(ticketTypeMap).map((type) => ({
      name: type,
      value: ticketTypeMap[type]
    }));

    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat]
    }));

    const analytics = {
      summary: {
        totalEvents,
        upcomingEvents,
        totalTicketsSold,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalAttendees: attendeeEmailSet.size
      },
      charts: {
        revenueOverTime,
        eventPerformance: eventPerformance.slice(0, 6),
        ticketDistribution,
        categoryDistribution
      }
    };

    return ApiResponse.success(res, analytics, 'Organizer analytics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings & attendee list for organizer's events
 * @route   GET /api/organizer/bookings
 * @access  Private (ORGANIZER, ADMIN)
 */
const getOrganizerBookings = async (req, res, next) => {
  try {
    const { eventId, search } = req.query;
    const organizerEvents = await Event.find({ organizer: req.user._id }).select('_id');
    const eventIds = organizerEvents.map((e) => e._id);

    const query = { event: { $in: eventIds } };

    if (eventId && eventIds.some((id) => id.toString() === eventId)) {
      query.event = eventId;
    }

    let bookings = await Booking.find(query)
      .populate('event', 'title category date venue startTime')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      bookings = bookings.filter(
        (b) =>
          b.bookingId.match(regex) ||
          b.attendeeDetails.name.match(regex) ||
          b.attendeeDetails.email.match(regex) ||
          (b.event && b.event.title.match(regex))
      );
    }

    return ApiResponse.success(res, bookings, 'Organizer bookings retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizerEvents,
  getOrganizerAnalytics,
  getOrganizerBookings
};
