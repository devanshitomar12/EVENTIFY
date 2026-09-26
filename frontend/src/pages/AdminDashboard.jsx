import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ShieldCheck,
  Users,
  Calendar,
  Ticket,
  TrendingUp,
  Trash2,
  Search,
  ExternalLink
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'events' | 'users'
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [eventStatusFilter, setEventStatusFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // Confirmation modal state
  const [confirmModalData, setConfirmModalData] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    action: null
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, eventsRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/events?limit=50'),
        api.get('/admin/users?limit=50')
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to load administration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Event Moderation Handlers
  const handleApproveEvent = async (eventId) => {
    try {
      await api.patch(`/admin/events/${eventId}/approve`);
      addToast('Event approved and published.', 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      await api.patch(`/admin/events/${eventId}/reject`);
      addToast('Event marked as rejected.', 'info');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Rejection failed', 'error');
    }
  };

  const handleDeleteEvent = (event) => {
    setConfirmModalData({
      isOpen: true,
      title: 'Remove Event',
      message: `Are you sure you want to permanently delete "${event.title}" from the platform?`,
      confirmText: 'Delete Event',
      action: async () => {
        try {
          setIsProcessingAction(true);
          await api.delete(`/admin/events/${event._id}`);
          addToast('Event removed from platform.', 'success');
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
          fetchAdminData();
        } catch (err) {
          addToast(err.message || 'Delete failed', 'error');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  // User Management Handlers
  const handleChangeRole = async (targetUser, newRole) => {
    try {
      await api.patch(`/admin/users/${targetUser._id}/role`, { role: newRole });
      addToast(`Updated ${targetUser.name}'s role to ${newRole}`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Role change failed', 'error');
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/admin/users/${targetUser._id}/status`, { status: newStatus });
      addToast(`User account ${newStatus.toLowerCase()} successfully`, 'info');
      fetchAdminData();
    } catch (err) {
      addToast(err.message || 'Status toggle failed', 'error');
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (eventStatusFilter === 'All') return true;
    return e.status === eventStatusFilter;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Platform Administration
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Overview of platform metrics, event moderation, and user accounts.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-gray-200/70 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Platform Stats' },
              { id: 'events', label: `Events (${events.length})` },
              { id: 'users', label: `Users (${users.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: PLATFORM OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-xs font-medium text-gray-500 block">Total Revenue</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  ₹{analytics?.kpis?.totalRevenue?.toLocaleString('en-IN') || '0'}
                </span>
                <span className="text-[11px] text-emerald-600 mt-1 block font-medium">
                  Platform gross
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-xs font-medium text-gray-500 block">Total Bookings</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  {analytics?.kpis?.totalBookings || 0}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Confirmed passes
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-xs font-medium text-gray-500 block">Total Events</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  {analytics?.kpis?.totalEvents || 0}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  {analytics?.kpis?.approvedEvents || 0} approved
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-xs font-medium text-gray-500 block">Attendees</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  {analytics?.kpis?.totalUsers || 0}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  User accounts
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-xs font-medium text-gray-500 block">Organizers</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">
                  {analytics?.kpis?.totalOrganizers || 0}
                </span>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Creator accounts
                </span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Gross Revenue Trend
                  </h3>
                  <span className="text-xs text-gray-400">Monthly</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analytics?.charts?.revenueTrends || []}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                          fontSize: '12px'
                        }}
                        formatter={(val) => [`₹${val}`, 'Gross Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#adminRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Booking Growth */}
              <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-brand-600" />
                    Monthly Bookings
                  </h3>
                  <span className="text-xs text-gray-400">Total volume</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics?.charts?.bookingGrowth || []}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="bookings" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVENT MODERATION */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Event Moderation</h2>
                <p className="text-xs text-gray-500">Review submitted events before they appear in public listings</p>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
                {['All', 'APPROVED', 'PENDING', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setEventStatusFilter(st)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      eventStatusFilter === st
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Organizer</th>
                      <th className="py-3 px-4">Date & Location</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">
                          No events found matching current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((evt) => (
                        <tr key={evt._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-gray-900">
                            <Link
                              to={`/events/${evt._id}`}
                              target="_blank"
                              className="hover:text-brand-600 transition-colors block text-sm max-w-xs truncate"
                            >
                              {evt.title}
                            </Link>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-gray-900 block">
                              {evt.organizer?.name || 'Platform User'}
                            </span>
                            <span className="text-[11px] text-gray-500">{evt.organizer?.email}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="block font-medium text-gray-900">
                              {new Date(evt.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-[11px] text-gray-500">{evt.city}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                              {evt.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                evt.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : evt.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {evt.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {evt.status !== 'APPROVED' && (
                                <button
                                  onClick={() => handleApproveEvent(evt._id)}
                                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {evt.status !== 'REJECTED' && (
                                <button
                                  onClick={() => handleRejectEvent(evt._id)}
                                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium transition-colors"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteEvent(evt)}
                                className="p-1.5 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">User Management</h2>
                <p className="text-xs text-gray-500">Manage user accounts, roles, and status</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name or email..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="All">All Roles</option>
                  <option value="USER">USER</option>
                  <option value="ORGANIZER">ORGANIZER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Account Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-400">
                          No users found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  u.profileImage ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    u.name
                                  )}&background=e2e8f0&color=475569`
                                }
                                alt={u.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                              <div>
                                <span className="font-semibold text-gray-900 block">{u.name}</span>
                                <span className="text-[11px] text-gray-500">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u, e.target.value)}
                              className="px-2 py-1 rounded bg-white border border-gray-300 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="USER">USER</option>
                              <option value="ORGANIZER">ORGANIZER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                                u.status === 'ACTIVE'
                                  ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                  : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModalData.isOpen}
          title={confirmModalData.title}
          message={confirmModalData.message}
          confirmText={confirmModalData.confirmText}
          loading={isProcessingAction}
          onConfirm={confirmModalData.action}
          onCancel={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
