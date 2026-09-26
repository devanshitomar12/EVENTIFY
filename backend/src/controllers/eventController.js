const Event = require('../models/Event');
const ApiResponse = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../config/cloudinary');

/**
 * @desc    Get all public events with search, filters, sorting and pagination
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      date,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 9,
      featured
    } = req.query;

    const query = { status: 'APPROVED' };

    // Search text query across title, description, venue, city
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { venue: regex },
        { city: regex }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // City filter
    if (city && city !== 'All') {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Date filters
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceConditions = {};
      if (minPrice !== undefined) priceConditions.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceConditions.$lte = Number(maxPrice);

      query.ticketTypes = {
        $elemMatch: {
          price: priceConditions
        }
      };
    }

    // Sorting
    let sortOptions = {};
    switch (sort) {
      case 'date':
        sortOptions = { date: 1 };
        break;
      case 'price_asc':
      case 'price':
        sortOptions = { 'ticketTypes.0.price': 1 };
        break;
      case 'price_desc':
        sortOptions = { 'ticketTypes.0.price': -1 };
        break;
      case 'popularity':
        sortOptions = { 'ticketTypes.sold': -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name email profileImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Event.countDocuments(query)
    ]);

    // Enhance events with startingPrice and totalRemaining
    const formattedEvents = events.map((event) => {
      const startingPrice =
        event.ticketTypes && event.ticketTypes.length > 0
          ? Math.min(...event.ticketTypes.map((t) => t.price))
          : 0;
      const totalRemaining =
        event.ticketTypes && event.ticketTypes.length > 0
          ? event.ticketTypes.reduce((acc, t) => acc + (t.quantity - (t.sold || 0)), 0)
          : 0;
      return {
        ...event,
        startingPrice,
        totalRemaining
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, formattedEvents, 'Events retrieved', 200, {
      total,
      page: pageNum,
      totalPages,
      hasMore: pageNum < totalPages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name email profileImage phone createdAt'
    );

    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }

    const eventObj = event.toObject({ virtuals: true });

    return ApiResponse.success(res, eventObj, 'Event retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related events in the same category
 * @route   GET /api/events/:id/related
 * @access  Public
 */
const getRelatedEvents = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }

    const related = await Event.find({
      _id: { $ne: event._id },
      category: event.category,
      status: 'APPROVED'
    })
      .populate('organizer', 'name email profileImage')
      .limit(3)
      .lean({ virtuals: true });

    return ApiResponse.success(res, related, 'Related events retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new event
 * @route   POST /api/events
 * @access  Private (Organizer, Admin)
 */
const createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      // If admin creates, auto-approved; organizers default to APPROVED for instant availability
      status: req.body.status || 'APPROVED'
    };

    const event = await Event.create(eventData);
    await event.populate('organizer', 'name email profileImage');

    return ApiResponse.success(res, event, 'Event created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private (Organizer owner, Admin)
 */
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }

    // Ownership check
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return ApiResponse.error(
        res,
        'Not authorized to update this event. You can only edit your own events.',
        403
      );
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('organizer', 'name email profileImage');

    return ApiResponse.success(res, event, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private (Organizer owner, Admin)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return ApiResponse.error(res, 'Event not found', 404);
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return ApiResponse.error(
        res,
        'Not authorized to delete this event. You can only delete your own events.',
        403
      );
    }

    await Event.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload event banner or profile image
 * @route   POST /api/events/upload-banner
 * @access  Private
 */
const uploadBanner = async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'Please provide an image file to upload', 400);
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      'eventify/events'
    );

    return ApiResponse.success(
      res,
      { url: uploadResult.url, publicId: uploadResult.publicId },
      'Image uploaded successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  getRelatedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadBanner
};
