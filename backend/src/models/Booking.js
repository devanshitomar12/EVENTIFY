const mongoose = require('mongoose');

const bookedTicketSchema = new mongoose.Schema({
  ticketType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    tickets: {
      type: [bookedTicketSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A booking must have at least one ticket'
      }
    },
    totalQuantity: {
      type: Number,
      default: function () {
        return this.tickets.reduce((sum, t) => sum + t.quantity, 0);
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Completed'],
      default: 'Confirmed'
    },
    qrCode: {
      type: String,
      required: true
    },
    attendeeDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' }
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
