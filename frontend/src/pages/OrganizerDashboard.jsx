import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle
} from 'lucide-react';

const categories = [
  'Technology',
  'Music',
  'Sports',
  'Business',
  'Education',
  'Entertainment',
  'Workshops',
  'Conferences'
];

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookingSearch, setBookingSearch] = useState('');

  // Delete modal state
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    category: 'Technology',
    description: '',
    image: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    venue: '',
    address: '',
    city: '',
    ticketTypes: [
      { name: 'General Admission', price: 50, quantity: 100, description: 'Standard admission to all sessions' },
      { name: 'VIP Pass', price: 150, quantity: 25, description: 'VIP lounge access and priority entry' }
    ],
    rules: [
      'Valid photo ID required at the venue entrance.',
      'Tickets once booked are subject to the platform cancellation policy.'
    ]
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, analyticsRes, bookingsRes] = await Promise.all([
        api.get('/organizer/events'),
        api.get('/organizer/analytics'),
        api.get('/organizer/bookings')
      ]);

      if (eventsRes.success) setEvents(eventsRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to load organizer dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('banner', file);

    try {
      setUploadingImage(true);
      addToast('Uploading image...', 'info', 2000);
      const res = await api.post('/events/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success && res.data.url) {
        setEventFormData((prev) => ({ ...prev, image: res.data.url }));
        addToast('Banner uploaded successfully.', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddTier = () => {
    setEventFormData((prev) => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        { name: 'Reserved Tier', price: 75, quantity: 50, description: '' }
      ]
    }));
  };

  const handleRemoveTier = (index) => {
    if (eventFormData.ticketTypes.length <= 1) {
      addToast('At least one ticket tier is required.', 'warning');
      return;
    }
    setEventFormData((prev) => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter((_, i) => i !== index)
    }));
  };

  const handleTierChange = (index, field, value) => {
    setEventFormData((prev) => {
      const updated = [...prev.ticketTypes];
      updated[index] = {
        ...updated[index],
        [field]: field === 'price' || field === 'quantity' ? Number(value) : value
      };
      return { ...prev, ticketTypes: updated };
    });
  };

  const handleEditClick = (evt) => {
    setEditingEventId(evt._id);
    setEventFormData({
      title: evt.title,
      category: evt.category,
      description: evt.description,
      image: evt.image,
      date: new Date(evt.date).toISOString().split('T')[0],
      startTime: evt.startTime,
      endTime: evt.endTime,
      venue: evt.venue,
      address: evt.address,
      city: evt.city,
      ticketTypes: evt.ticketTypes.map((t) => ({
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        description: t.description || ''
      })),
      rules: evt.rules && evt.rules.length > 0 ? evt.rules : ['Valid photo ID required on arrival.']
    });
    setActiveTab('create');
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.image) {
      addToast('Please provide an image banner URL or upload a file.', 'warning');
      return;
    }

    try {
      setSavingEvent(true);

      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, eventFormData);
        addToast('Event updated successfully.', 'success');
      } else {
        await api.post('/events', eventFormData);
        addToast('Event published successfully.', 'success');
      }

      setEditingEventId(null);
      setEventFormData({
        title: '',
        category: 'Technology',
        description: '',
        image: '',
        date: '',
        startTime: '10:00 AM',
        endTime: '05:00 PM',
        venue: '',
        address: '',
        city: '',
        ticketTypes: [
          { name: 'General Admission', price: 50, quantity: 100, description: '' }
        ],
        rules: ['Valid photo ID required.']
      });

      fetchData();
      setActiveTab('events');
    } catch (err) {
      addToast(err.message || 'Failed to save event', 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/events/${eventToDelete._id}`);
      addToast('Event removed.', 'success');
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to delete event', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!bookingSearch.trim()) return true;
    const term = bookingSearch.toLowerCase();
    return (
      b.bookingId.toLowerCase().includes(term) ||
      b.attendeeDetails?.name.toLowerCase().includes(term) ||
      b.attendeeDetails?.email.toLowerCase().includes(term) ||
      b.event?.title.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Organizer Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage your event listings, ticket sales and registered attendees.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingEventId(null);
              setActiveTab('create');
            }}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-1 gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'events', label: `My Events (${events.length})`, icon: Calendar },
            { id: 'create', label: editingEventId ? 'Edit Event' : 'Create Event', icon: Plus },
            { id: 'attendees', label: 'Attendees & Orders', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-medium text-gray-500 block">Total Revenue</span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">
                  ${analytics?.summary?.totalRevenue?.toLocaleString() || '0'}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">Live ticket sales</span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-medium text-gray-500 block">Tickets Sold</span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">
                  {analytics?.summary?.totalTicketsSold || 0}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">Across all tiers</span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-medium text-gray-500 block">Active Events</span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">
                  {analytics?.summary?.totalEvents || events.length}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {analytics?.summary?.upcomingEvents || 0} upcoming
                </span>
              </div>

              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-medium text-gray-500 block">Attendees</span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">
                  {analytics?.summary?.totalAttendees || 0}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">Confirmed guests</span>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Area Chart */}
              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Revenue Over Time
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics?.charts?.revenueOverTime || []}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#111827',
                          fontSize: '12px'
                        }}
                        formatter={(val) => [`$${val}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fill="#eef2ff"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Tickets Sold */}
              <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-indigo-600" />
                  Ticket Sales By Event
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics?.charts?.eventPerformance || []}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          color: '#111827',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="ticketsSold" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Tickets Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY EVENTS TABLE */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Events ({events.length})</h2>
            </div>

            {events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Date & City</th>
                      <th className="py-3 px-4">Tickets Sold</th>
                      <th className="py-3 px-4">Revenue</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {events.map((evt) => {
                      const totalSold = evt.ticketTypes.reduce((s, t) => s + (t.sold || 0), 0);
                      const totalCap = evt.ticketTypes.reduce((s, t) => s + t.quantity, 0);

                      return (
                        <tr key={evt._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={evt.image}
                                alt={evt.title}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                              />
                              <div>
                                <Link
                                  to={`/events/${evt._id}`}
                                  className="font-semibold text-gray-900 hover:text-indigo-600 block text-xs"
                                >
                                  {evt.title}
                                </Link>
                                <span className="text-[11px] text-gray-500">{evt.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="block font-medium text-gray-900">
                              {new Date(evt.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-[11px] text-gray-500">{evt.city}</span>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {totalSold} / {totalCap}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            ${evt.stats?.revenue?.toLocaleString() || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase ${
                                evt.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : evt.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {evt.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                to={`/events/${evt._id}`}
                                target="_blank"
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                                title="View public page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleEditClick(evt)}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-indigo-600"
                                title="Edit event"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEventToDelete(evt);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"
                                title="Delete event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 text-xs">
                No events found. Click "Create Event" to post your first listing.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE / EDIT EVENT FORM */}
        {activeTab === 'create' && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingEventId ? 'Edit Event' : 'Create an Event'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in event details, schedule, venue, and configure ticket tiers.
              </p>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-5">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.title}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g. Next-Gen Tech Summit"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={eventFormData.description}
                  onChange={(e) =>
                    setEventFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Outline the schedule, key topics, and what attendees should expect..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Banner Image URL *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    required
                    value={eventFormData.image}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, image: e.target.value }))
                    }
                    placeholder="https://images.unsplash.com/... or upload"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />

                  <label className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer flex items-center justify-center gap-2 shrink-0">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {eventFormData.image && (
                  <div className="mt-2.5 h-32 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={eventFormData.image}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventFormData.date}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.startTime}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.endTime}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    placeholder="05:00 PM"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.venue}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, venue: e.target.value }))
                    }
                    placeholder="Moscone Convention Center"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.address}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="747 Howard St"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.city}
                    onChange={(e) =>
                      setEventFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="San Francisco"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Ticket Tiers */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Ticket Tiers</h3>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {eventFormData.ticketTypes.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] text-gray-500">Tier Name</label>
                        <input
                          type="text"
                          required
                          value={tier.name}
                          onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                          placeholder="e.g. VIP Pass"
                          className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-gray-500">Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={tier.price}
                          onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-gray-500">Capacity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={tier.quantity}
                          onChange={(e) => handleTierChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] text-gray-500">Description</label>
                        <input
                          type="text"
                          value={tier.description || ''}
                          onChange={(e) => handleTierChange(idx, 'description', e.target.value)}
                          placeholder="Included perks..."
                          className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs bg-white"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('events')}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingEvent && (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{editingEventId ? 'Update Event' : 'Publish Event'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: ATTENDEES */}
        {activeTab === 'attendees' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-gray-900">Attendee Roster</h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Filter name, email or code..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Attendee</th>
                      <th className="py-3 px-4">Tickets</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-gray-800">
                          {b.bookingId}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {b.event?.title || 'Event'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">
                            {b.attendeeDetails?.name}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {b.attendeeDetails?.email}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {b.tickets.map((t, i) => (
                            <span key={i} className="block text-[11px]">
                              {t.quantity}x {t.ticketType}
                            </span>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          ${b.totalAmount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 text-xs">
                No matching attendees or bookings found.
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete Event"
          message={`Are you sure you want to delete "${eventToDelete?.title}"? This cannot be undone.`}
          confirmText="Delete Event"
          confirmVariant="danger"
          loading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setEventToDelete(null);
          }}
        />
      </div>
    </div>
  );
};

export default OrganizerDashboard;
