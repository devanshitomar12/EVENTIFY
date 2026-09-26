import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const DigitalTicket = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const ticketRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bookings/${id}`);
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError('Ticket could not be located.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!ticketRef.current || !booking) return;

    try {
      setDownloadingPdf(true);
      addToast('Preparing printable PDF...', 'info', 2000);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Eventify-Ticket-${booking.bookingId}.pdf`);

      addToast('Ticket PDF downloaded.', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      addToast('Failed to export PDF.', 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Ticket Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'This ticket reservation could not be verified.'}</p>
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Tickets</span>
        </Link>
      </div>
    );
  }

  const event = booking.event || {};
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'TBD';

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Tickets</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Printable Ticket Pass Container */}
        <div className="flex justify-center">
          <div
            ref={ticketRef}
            className="w-full max-w-3xl bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left 70%: Event & Attendee Details */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    E
                  </div>
                  <span className="text-sm font-bold text-gray-900">Eventify Pass</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                    Reference
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-900">
                    {booking.bookingId}
                  </span>
                </div>
              </div>

              {/* Event Name */}
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {event.category || 'Event'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 leading-snug">
                  {event.title}
                </h2>
              </div>

              {/* Logistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-600">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date</span>
                  <span className="font-semibold text-gray-900 text-sm">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Time</span>
                  <span className="font-semibold text-gray-900 text-sm">{event.startTime || 'TBD'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Venue</span>
                  <span className="font-semibold text-gray-900 text-sm truncate block">
                    {event.venue}, {event.city}
                  </span>
                </div>
              </div>

              {/* Attendee & Tiers */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Attendee</span>
                  <span className="font-bold text-gray-900">
                    {booking.attendeeDetails?.name || 'Guest'}
                  </span>
                  <span className="text-gray-500 text-[11px] block">{booking.attendeeDetails?.email}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Tier</span>
                  <div className="flex gap-1.5 justify-end">
                    {booking.tickets.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded"
                      >
                        {t.quantity}x {t.ticketType}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated dashed divider */}
            <div className="border-t md:border-t-0 md:border-l border-dashed border-gray-300 relative flex items-center justify-center">
              <div className="hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-50 border border-gray-300"></div>
              <div className="hidden md:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-50 border border-gray-300"></div>
            </div>

            {/* Right 30%: QR Code Stub */}
            <div className="w-full md:w-64 bg-gray-50 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Ticket</span>
              </div>

              {/* QR Code */}
              <div className="w-40 h-40 bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                <img
                  src={booking.qrCode}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <span className="text-[10px] text-gray-500 uppercase font-mono">
                Present at check-in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicket;
