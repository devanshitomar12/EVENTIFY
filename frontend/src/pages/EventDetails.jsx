import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventCard from '../components/EventCard';
import TicketCheckoutModal from '../components/TicketCheckoutModal';
import BookingSuccessModal from '../components/BookingSuccessModal';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError('');
        const [eventRes, relatedRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/related`)
        ]);

        if (eventRes.success) {
          setEvent(eventRes.data);
        } else {
          setError('Event details could not be retrieved.');
        }

        if (relatedRes.success) {
          setRelatedEvents(relatedRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBookClick = () => {
    if (!isAuthenticated) {
      addToast('Please log in or register to book tickets.', 'info');
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleBookingSuccess = (booking) => {
    setIsCheckoutOpen(false);
    setConfirmedBooking(booking);
    setIsSuccessModalOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Check out ${event?.title} on Eventify!`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Event link copied to clipboard.', 'success');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="h-96 bg-gray-200 rounded-xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Event Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'This event does not exist or has been removed.'}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const startingPrice =
    event.ticketTypes && event.ticketTypes.length > 0
      ? Math.min(...event.ticketTypes.map((t) => t.price))
      : 0;

  const totalRemaining =
    event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes.reduce((acc, t) => acc + (t.quantity - (t.sold || 0)), 0)
      : 0;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Events</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Main Event Image Banner */}
        <div className="relative aspect-[21/9] w-full max-h-[460px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/95 text-gray-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm border border-gray-200">
              {event.category}
            </span>
          </div>
        </div>

        {/* Main Grid: Details (Left) + Sticky Booking Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Title, Logistics, Description, Tickets, Rules */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {event.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-800">{formattedDate}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{event.startTime} - {event.endTime}</span>
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{event.venue}, {event.city}</span>
                </span>
              </div>
            </div>

            {/* Host Card */}
            {event.organizer && (
              <div className="flex items-center gap-3.5 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <img
                  src={
                    event.organizer.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      event.organizer.name
                    )}&background=4f46e5&color=fff&bold=true`
                  }
                  alt={event.organizer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider block">
                    Hosted by
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {event.organizer.name}
                  </span>
                </div>
              </div>
            )}

            {/* About Section */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <h2 className="text-lg font-bold text-gray-900">About this event</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Ticket Options Breakdown */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Ticket Options</h2>
                <span className="text-xs text-gray-500">
                  {totalRemaining > 0 ? `${totalRemaining} tickets remaining` : 'Sold out'}
                </span>
              </div>

              <div className="space-y-3">
                {event.ticketTypes.map((tier) => {
                  const remaining = tier.quantity - (tier.sold || 0);
                  const isSoldOut = remaining <= 0;

                  return (
                    <div
                      key={tier._id || tier.name}
                      className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">{tier.name}</h3>
                          {isSoldOut ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              Sold Out
                            </span>
                          ) : remaining <= 15 ? (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Only {remaining} left
                            </span>
                          ) : null}
                        </div>
                        {tier.description && (
                          <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-gray-900">
                          {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Guidelines & Rules */}
            {event.rules && event.rules.length > 0 && (
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">Important Information</h2>
                <ul className="space-y-2">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Reservation Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 p-6 bg-white shadow-sm space-y-5">
              <div>
                <span className="text-xs text-gray-500 block">General Admission</span>
                <span className="text-2xl font-bold text-gray-900 mt-0.5 block">
                  {startingPrice === 0 ? 'Free' : `$${startingPrice}`}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 block">{formattedDate}</span>
                    <span className="text-gray-500">{event.startTime} - {event.endTime}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900 block">{event.venue}</span>
                    <span className="text-gray-500">{event.address}, {event.city}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookClick}
                disabled={totalRemaining <= 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {totalRemaining > 0 ? 'Book Tickets' : 'Sold Out'}
              </button>

              <div className="text-center text-[11px] text-gray-400 pt-2 border-t border-gray-100 space-y-1">
                <p>Instant verifiable QR pass</p>
                <p>Cancellable up to 24 hours before event</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="border-t border-gray-200 pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                More {event.category} Events
              </h3>
              <Link
                to={`/events?category=${event.category}`}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((evt) => (
                <EventCard key={evt._id} event={evt} />
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <TicketCheckoutModal
          event={event}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />

        <BookingSuccessModal
          booking={confirmedBooking}
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default EventDetails;
