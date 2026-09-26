import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  X,
  Ticket,
  Plus,
  Minus,
  Calendar,
  MapPin,
  ShieldCheck,
  User,
  Mail,
  Phone
} from 'lucide-react';

const TicketCheckoutModal = ({ event, isOpen, onClose, onBookingSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [ticketQuantities, setTicketQuantities] = useState(() => {
    const initial = {};
    if (event?.ticketTypes?.length > 0) {
      initial[event.ticketTypes[0].name] = 1;
    }
    return initial;
  });

  const [attendeeName, setAttendeeName] = useState(user?.name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen || !event) return null;

  const handleQuantityChange = (tierName, delta, maxAvailable) => {
    setTicketQuantities((prev) => {
      const current = prev[tierName] || 0;
      const updated = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [tierName]: updated };
    });
    setFormError('');
  };

  const selectedTicketsList = (event.ticketTypes || [])
    .map((tier) => {
      const qty = ticketQuantities[tier.name] || 0;
      return {
        ticketType: tier.name,
        ticketTypeId: tier._id,
        price: tier.price,
        quantity: qty
      };
    })
    .filter((t) => t.quantity > 0);

  const totalQuantity = selectedTicketsList.reduce((sum, t) => sum + t.quantity, 0);
  const totalAmount = selectedTicketsList.reduce((sum, t) => sum + t.price * t.quantity, 0);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setFormError('');

    if (totalQuantity === 0) {
      setFormError('Please select at least 1 ticket to proceed.');
      return;
    }

    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setFormError('Please provide attendee name and email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        eventId: event._id,
        tickets: selectedTicketsList,
        attendeeDetails: {
          name: attendeeName.trim(),
          email: attendeeEmail.trim(),
          phone: attendeePhone.trim()
        }
      };

      const response = await api.post('/bookings', payload);
      if (response.success && response.data) {
        addToast('Ticket reservation confirmed!', 'success');
        onBookingSuccess(response.data);
      } else {
        throw new Error(response.message || 'Booking failed');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to complete booking');
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-xl bg-white border border-gray-200 p-6 shadow-xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-gray-100 pb-4 mb-5">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
            Reserve Tickets
          </span>
          <h2 className="text-xl font-bold text-gray-900 leading-snug">{event.title}</h2>
          <p className="text-xs text-gray-500 mt-1">
            {event.venue}, {event.city} • {event.startTime}
          </p>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* Step 1: Select Tiers */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Ticket Quantities
            </label>

            <div className="space-y-2.5">
              {event.ticketTypes.map((tier) => {
                const available = tier.quantity - (tier.sold || 0);
                const isSoldOut = available <= 0;
                const qty = ticketQuantities[tier.name] || 0;

                return (
                  <div
                    key={tier._id || tier.name}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-colors ${
                      qty > 0
                        ? 'border-indigo-600 bg-indigo-50/20'
                        : 'border-gray-200 bg-white'
                    } ${isSoldOut ? 'opacity-50' : ''}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {tier.name}
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        </span>
                      </div>
                      {isSoldOut ? (
                        <span className="text-[10px] font-bold text-red-600 uppercase">
                          Sold Out
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500">
                          {available} tickets remaining
                        </span>
                      )}
                    </div>

                    {!isSoldOut && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(tier.name, -1, available)}
                          disabled={qty <= 0}
                          className="w-7 h-7 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(tier.name, 1, available)}
                          disabled={qty >= available}
                          className="w-7 h-7 rounded border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Attendee Info */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Attendee Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-gray-500 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Order Summary */}
          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Total Tickets:</span>
              <span className="font-semibold text-gray-900">{totalQuantity}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Service Fee:</span>
              <span className="font-semibold text-emerald-600">$0.00 (Included)</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-lg font-bold text-gray-900">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || totalQuantity === 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isSubmitting ? 'Confirming...' : 'Confirm Reservation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketCheckoutModal;
