const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please specify ticket type name (e.g. General, VIP, Premium)'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please specify ticket price'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify available ticket quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  sold: {
    type: Number,
    default: 0,
    min: [0, 'Sold count cannot be negative']
  },
  description: {
    type: String,
    default: ''
  }
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [120, 'Title cannot be more than 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add an event description']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Music',
        'Technology',
        'Sports',
        'Business',
        'Education',
        'Entertainment',
        'Workshops',
        'Conferences'
      ]
    },
    image: {
      type: String,
      required: [true, 'Please provide an event banner image']
    },
    date: {
      type: Date,
      required: [true, 'Please specify an event date']
    },
    startTime: {
      type: String,
      required: [true, 'Please specify a start time']
    },
    endTime: {
      type: String,
      required: [true, 'Please specify an end time']
    },
    venue: {
      type: String,
      required: [true, 'Please specify a venue name'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Please provide the physical address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
      trim: true
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'An event must have at least one ticket type'
      }
    },
    rules: {
      type: [String],
      default: [
        'Valid photo ID is required at the venue entrance.',
        'Tickets once booked are subject to the platform cancellation policy.',
        'Outside food and beverages are not allowed inside the auditorium/venue.'
      ]
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED'
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating starting price
eventSchema.virtual('startingPrice').get(function () {
  if (!this.ticketTypes || this.ticketTypes.length === 0) return 0;
  return Math.min(...this.ticketTypes.map((t) => t.price));
});

// Virtual for calculating total remaining tickets
eventSchema.virtual('totalRemaining').get(function () {
  if (!this.ticketTypes || this.ticketTypes.length === 0) return 0;
  return this.ticketTypes.reduce((acc, t) => acc + (t.quantity - (t.sold || 0)), 0);
});

// Virtual for total capacity
eventSchema.virtual('totalCapacity').get(function () {
  if (!this.ticketTypes || this.ticketTypes.length === 0) return 0;
  return this.ticketTypes.reduce((acc, t) => acc + t.quantity, 0);
});

// Indexes for high performance querying
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ city: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ featured: 1 });
eventSchema.index({ title: 'text', description: 'text', city: 'text', venue: 'text' });

module.exports = mongoose.model('Event', eventSchema);
