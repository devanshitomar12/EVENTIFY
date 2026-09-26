import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  Calendar,
  MapPin,
  QrCode,
  Ticket,
  ArrowRight
} from 'lucide-react';

const MyBookings = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  // Cancel modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = filterStatus !== 'All' ? `/bookings/my?status=${filterStatus}` : '/bookings/my';
      const response = await api.get(url);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to retrieve bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleOpenCancelModal = (booking) => {
    setCancellingBooking(booking);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsProcessingCancel(true);

    try {
      const response = await api.patch(`/bookings/${cancellingBooking._id}/cancel`, {
        reason: cancelReason || 'Cancelled by user'
      });

      if (response.success) {
        addToast('Booking cancelled. Tickets returned to inventory.', 'success');
        setIsCancelModalOpen(false);
        setCancellingBooking(null);
        fetchBookings();
      } else {
        throw new Error(response.message || 'Failed to cancel booking');
      }
    } catch (err) {
      addToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setIsProcessingCancel(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Tickets
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Access your digital entry passes and manage reservations.
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
            {['All', 'Confirmed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 rounded-xl border border-gray-200 bg-gray-50 animate-pulse p-4"
              ></div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'Confirmed';
              const isCancelled = booking.status === 'Cancelled';
              const eventDate = booking.event?.date ? new Date(booking.event.date) : null;
              const isPastEvent = eventDate ? eventDate < new Date() : false;
              const canCancel = isConfirmed && !isPastEvent;

              return (
                <div
                  key={booking._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1 min-w-0">
                    <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={booking.event?.image}
                        alt={booking.event?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-gray-700">
                          {booking.bookingId}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <Link to={`/events/${booking.event?._id}`}>
                        <h3 className="text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors truncate">
                          {booking.event?.title || 'Event Booking'}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-600 flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>
                          {eventDate
                            ? eventDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'TBD'}{' '}
                          • {booking.event?.startTime || 'TBD'}
                        </span>
                      </p>

                      <div className="pt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                        {booking.tickets.map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-700"
                          >
                            {t.quantity}x {t.ticketType} (${t.price} ea)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Price & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-gray-500 block">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${booking.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tickets/${booking._id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pass</span>
                      </Link>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(booking)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
            <Ticket className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-900">No tickets found</h3>
            <p className="text-xs text-gray-500 mt-1">
              You haven't booked any {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} events yet.
            </p>
            <Link
              to="/events"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg"
            >
              <span>Browse Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Cancel Modal */}
        <ConfirmModal
          isOpen={isCancelModalOpen}
          title="Cancel Reservation"
          message={`Are you sure you want to cancel booking ${cancellingBooking?.bookingId}? Your reservation will be voided and tickets returned to inventory.`}
          confirmText="Yes, Cancel Booking"
          cancelText="Keep Tickets"
          confirmVariant="danger"
          loading={isProcessingCancel}
          onConfirm={handleConfirmCancel}
          onCancel={() => {
            setIsCancelModalOpen(false);
            setCancellingBooking(null);
          }}
        >
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-gray-700">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </ConfirmModal>
      </div>
    </div>
  );
};

export default MyBookings;
