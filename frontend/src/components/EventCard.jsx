import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

const EventCard = ({ event }) => {
  if (!event) return null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const startingPrice =
    event.startingPrice !== undefined
      ? event.startingPrice
      : event.ticketTypes && event.ticketTypes.length > 0
      ? Math.min(...event.ticketTypes.map((t) => t.price))
      : 0;

  const totalRemaining =
    event.totalRemaining !== undefined
      ? event.totalRemaining
      : event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes.reduce((acc, t) => acc + (t.quantity - (t.sold || 0)), 0)
      : 0;

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      {/* Event Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {/* Subtle Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-block bg-white/95 backdrop-blur-sm text-gray-800 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm border border-gray-100">
            {event.category}
          </span>
        </div>

        {totalRemaining > 0 && totalRemaining <= 25 && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-block bg-amber-50 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded border border-amber-200">
              Only {totalRemaining} tickets left
            </span>
          </div>
        )}

        {totalRemaining === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Time */}
          <p className="text-xs font-semibold text-indigo-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {formattedDate} • {event.startTime}
            </span>
          </p>

          {/* Event Title */}
          <Link to={`/events/${event._id}`}>
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>
          </Link>

          {/* Location */}
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {event.venue}, {event.city}
            </span>
          </p>
        </div>

        {/* Footer: Price & Organizer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            By <span className="font-medium text-gray-700">{event.organizer?.name?.split(' ')[0] || 'Host'}</span>
          </span>

          <span className="font-bold text-gray-900 text-sm">
            {startingPrice === 0 ? 'Free' : `From $${startingPrice}`}
          </span>
        </div>
      </div>

      {/* Invisible Full Link */}
      <Link
        to={`/events/${event._id}`}
        aria-label={`View ${event.title}`}
        className="absolute inset-0 z-10"
      />
    </div>
  );
};

export default EventCard;
