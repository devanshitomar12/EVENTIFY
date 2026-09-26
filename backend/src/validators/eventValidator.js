const { z } = require('zod');

const ticketTypeInputSchema = z.object({
  name: z.string().min(1, 'Ticket tier name is required (e.g. General, VIP, Early Bird)'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  description: z.string().optional()
});

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'Music',
    'Technology',
    'Sports',
    'Business',
    'Education',
    'Entertainment',
    'Workshops',
    'Conferences'
  ]),
  image: z.string().min(1, 'Event image URL or banner is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid event date'
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  venue: z.string().min(2, 'Venue is required'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  ticketTypes: z.array(ticketTypeInputSchema).min(1, 'At least one ticket type is required'),
  rules: z.array(z.string()).optional(),
  featured: z.boolean().optional()
});

const updateEventSchema = createEventSchema.partial();

module.exports = {
  createEventSchema,
  updateEventSchema
};
