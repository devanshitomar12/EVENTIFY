import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { User, Mail, Phone, Lock, Shield, Camera, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'password'

  // General profile state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);

    try {
      await updateProfile({ name, phone, profileImage });
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setUpdatingPassword(true);

    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      addToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal details and account credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center text-center space-y-4 h-fit">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-100">
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=4f46e5&color=fff&bold=true`
              }
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-brand-600" />
            {user?.role}
          </div>

          <div className="w-full pt-4 border-t border-gray-100 text-xs text-gray-500 flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Member since:</span>
              <span className="text-gray-900 font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'Recent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Account status:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Tabs */}
        <div className="md:col-span-2 space-y-6">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'general'
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              General Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'password'
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Password & Security
            </button>
          </div>

          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'general' && (
            <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                Personal details
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Email address cannot be changed directly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Avatar image URL
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="url"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {updatingProfile ? 'Saving changes...' : 'Save changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                Change password
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Current password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {updatingPassword ? 'Updating password...' : 'Update password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
