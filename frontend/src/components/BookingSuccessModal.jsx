import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, QrCode, ArrowRight, X } from 'lucide-react';

const BookingSuccessModal = ({ booking, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-white border border-gray-200 p-6 shadow-xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Confirmation Icon */}
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          Booking Confirmed
        </h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Your ticket has been confirmed and emailed to {booking.attendeeDetails?.email}.
        </p>

        {/* Booking Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left mb-6 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">
                Booking Reference
              </span>
              <span className="text-sm font-mono font-bold text-gray-900">
                {booking.bookingId}
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Confirmed
            </span>
          </div>

          <div className="flex gap-4 items-center">
            {booking.qrCode && (
              <div className="w-16 h-16 bg-white p-1 rounded border border-gray-200 shrink-0 flex items-center justify-center">
                <img
                  src={booking.qrCode}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {booking.event?.title || 'Event Booking'}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {booking.event?.venue}, {booking.event?.city}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              navigate(`/tickets/${booking._id}`);
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>View Pass</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/my-bookings');
            }}
            className="w-full py-2.5 px-4 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>My Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
