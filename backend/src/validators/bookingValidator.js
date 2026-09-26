const { z } = require('zod');

const bookTicketsSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  tickets: z
    .array(
      z.object({
        ticketType: z.string().min(1, 'Ticket type name is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1')
      })
    )
    .min(1, 'Must select at least one ticket to book'),
  attendeeDetails: z.object({
    name: z.string().min(2, 'Attendee name is required'),
    email: z.string().email('Attendee valid email is required'),
    phone: z.string().optional()
  })
});

const cancelBookingSchema = z.object({
  reason: z.string().optional()
});

module.exports = {
  bookTicketsSchema,
  cancelBookingSchema
};
