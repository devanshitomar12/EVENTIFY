const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const ApiResponse = require('../utils/apiResponse');
const { generateBookingId } = require('../utils/generateId');
const { generateBookingQRCode } = require('../services/qrService');
const { sendBookingConfirmationEmail, sendCancellationEmail } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * @desc    Create a new booking with atomic ticket availability validation
 * @route   POST /api/bookings
 * @access  Private (USER, ORGANIZER, ADMIN)
 */
const createBooking = async (req, res, next) => {
  try {
    const { eventId, tickets, attendeeDetails } = req.body;
    const userId = req.user._id;

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return ApiResponse.error(res, 'At least one ticket selection is required', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }

    if (event.status !== 'APPROVED') {
      return ApiResponse.error(res, 'This event is not currently accepting bookings', 400);
    }

    // Check if event date has already passed
    if (new Date(event.date) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return ApiResponse.error(res, 'Cannot book tickets for an event that has already ended', 400);
    }

    // Validate ticket types and calculate total with server-side prices
    let totalAmount = 0;
    const validatedTickets = [];

    for (const item of tickets) {
      if (item.quantity <= 0) continue;

      const serverTier = event.ticketTypes.find(
        (t) => t.name.toLowerCase() === item.ticketType.toLowerCase() || t._id.toString() === item.ticketTypeId
      );

      if (!serverTier) {
        return ApiResponse.error(
          res,
          `Invalid ticket type specified: '${item.ticketType}'`,
          400
        );
      }

      const availableSeats = serverTier.quantity - (serverTier.sold || 0);
      if (item.quantity > availableSeats) {
        return ApiResponse.error(
          res,
          `Only ${availableSeats} ticket(s) remaining for ${serverTier.name}. You requested ${item.quantity}.`,
          400
        );
      }

      const itemTotal = serverTier.price * item.quantity;
      totalAmount += itemTotal;

      validatedTickets.push({
        ticketType: serverTier.name,
        price: serverTier.price,
        quantity: item.quantity,
        tierId: serverTier._id
      });
    }

    if (validatedTickets.length === 0) {
      return ApiResponse.error(res, 'Ticket quantity must be greater than zero', 400);
    }

    // Atomic update to avoid race conditions and overbooking:
    // Decrement available capacity by incrementing sold atomically with $gte condition
    for (const item of validatedTickets) {
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          'ticketTypes._id': item.tierId,
          $expr: {
            $lte: [
              {
                $add: [
                  {
                    $arrayElemAt: [
                      '$ticketTypes.sold',
                      { $indexOfArray: ['$ticketTypes._id', item.tierId] }
                    ]
                  },
                  item.quantity
                ]
              },
              {
                $arrayElemAt: [
                  '$ticketTypes.quantity',
                  { $indexOfArray: ['$ticketTypes._id', item.tierId] }
                ]
              }
            ]
          }
        },
        {
          $inc: { 'ticketTypes.$.sold': item.quantity }
        },
        { new: true }
      );

      if (!updatedEvent) {
        // Rollback any previous ticket deductions in this batch
        for (const prev of validatedTickets) {
          if (prev.tierId === item.tierId) break;
          await Event.updateOne(
            { _id: eventId, 'ticketTypes._id': prev.tierId },
            { $inc: { 'ticketTypes.$.sold': -prev.quantity } }
          );
        }
        return ApiResponse.error(
          res,
          `High demand! Not enough ${item.ticketType} tickets available. Please try with fewer tickets.`,
          409
        );
      }
    }

    // Generate unique professional booking reference ID
    const bookingId = generateBookingId();

    // Generate QR Code data
    const qrPayload = {
      bookingId,
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      venue: event.venue,
      attendeeName: attendeeDetails.name,
      attendeeEmail: attendeeDetails.email,
      tickets: validatedTickets.map((t) => ({ type: t.ticketType, qty: t.quantity })),
      totalAmount,
      issuedAt: new Date().toISOString()
    };

    const qrCode = await generateBookingQRCode(qrPayload);

    // Save booking record
    const booking = await Booking.create({
      bookingId,
      user: userId,
      event: eventId,
      tickets: validatedTickets.map((t) => ({
        ticketType: t.ticketType,
        price: t.price,
        quantity: t.quantity
      })),
      totalAmount,
      status: 'Confirmed',
      qrCode,
      attendeeDetails: {
        name: attendeeDetails.name,
        email: attendeeDetails.email,
        phone: attendeeDetails.phone || ''
      }
    });

    await booking.populate('event', 'title category image date startTime endTime venue address city');

    // Trigger confirmation email asynchronously (never blocking the response)
    sendBookingConfirmationEmail({
      user: req.user,
      event,
      booking
    }).catch((err) => logger.error('Async booking email failed:', err.message));

    return ApiResponse.success(res, booking, 'Booking confirmed successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's personal booking history
 * @route   GET /api/bookings/my
 * @access  Private
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status && ['Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('event', 'title category image date startTime endTime venue address city')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, bookings, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single booking by ID or reference
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support both Mongo ObjectId and BookingId string (EVT-...)
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { bookingId: id };

    const booking = await Booking.findOne(query)
      .populate('event', 'title category image date startTime endTime venue address city rules organizer')
      .populate('user', 'name email phone');

    if (!booking) {
      return ApiResponse.error(res, 'Booking record not found', 404);
    }

    // Ensure only booking owner, event organizer, or admin can access
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    const isOrganizer =
      booking.event &&
      booking.event.organizer &&
      booking.event.organizer.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isOrganizer) {
      return ApiResponse.error(res, 'Not authorized to view this booking', 403);
    }

    return ApiResponse.success(res, booking, 'Booking details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an eligible booking and restore ticket capacity
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate('event');
    if (!booking) {
      return ApiResponse.error(res, 'Booking not found', 404);
    }

    // Check authorization: booking owner or admin
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return ApiResponse.error(res, 'Not authorized to cancel this booking', 403);
    }

    if (booking.status === 'Cancelled') {
      return ApiResponse.error(res, 'Booking has already been cancelled', 400);
    }

    // Verify event hasn't started yet
    if (booking.event && new Date(booking.event.date) < new Date()) {
      return ApiResponse.error(
        res,
        'Cannot cancel booking for an event that has already commenced or concluded',
        400
      );
    }

    // Restore tickets back to event inventory atomically
    if (booking.event && booking.tickets && booking.tickets.length > 0) {
      for (const ticket of booking.tickets) {
        await Event.updateOne(
          {
            _id: booking.event._id,
            'ticketTypes.name': ticket.ticketType
          },
          {
            $inc: { 'ticketTypes.$.sold': -ticket.quantity }
          }
        );
      }
    }

    booking.status = 'Cancelled';
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();

    // Dispatch cancellation email
    sendCancellationEmail({
      user: req.user,
      event: booking.event,
      booking
    }).catch((err) => logger.error('Async cancellation email failed:', err.message));

    return ApiResponse.success(res, booking, 'Booking cancelled successfully and ticket inventory restored');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};
