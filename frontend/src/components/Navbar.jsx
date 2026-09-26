import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Ticket,
  LayoutDashboard,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronDown,
  Search
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isOrganizer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Eventify
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/events"
                className={`transition-colors ${
                  isActive('/events')
                    ? 'text-indigo-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Events
              </Link>
              <Link
                to="/events?category=All"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Categories
              </Link>
              <Link
                to={isAuthenticated && isOrganizer ? "/organizer" : "/events"}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                For Organizers
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/events"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Search Events"
            >
              <Search className="w-4 h-4" />
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                  isActive('/my-bookings')
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Ticket className="w-4 h-4 text-gray-500" />
                <span>My Tickets</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                  location.pathname.startsWith('/admin')
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-gray-500" />
                <span>Admin</span>
              </Link>
            )}

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/login?role=organizer"
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Event</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {isOrganizer && (
                  <Link
                    to="/organizer?tab=create"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Event</span>
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none"
                  >
                    <img
                      src={
                        user.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&background=4f46e5&color=fff&bold=true`
                      }
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-gray-800 hidden lg:block">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-gray-200 shadow-dropdown py-1.5 z-50"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Ticket className="w-4 h-4 text-gray-500" />
                        My Tickets
                      </Link>

                      {isOrganizer && (
                        <Link
                          to="/organizer"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-500" />
                          Organizer Dashboard
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-gray-500" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        Account Settings
                      </Link>

                      <div className="my-1 border-t border-gray-100"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-800 rounded-md hover:bg-gray-50"
          >
            Explore Events
          </Link>
          <Link
            to="/events?category=All"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-gray-800 rounded-md hover:bg-gray-50"
          >
            Categories
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-800 rounded-md hover:bg-gray-50"
              >
                My Tickets
              </Link>
              {isOrganizer && (
                <Link
                  to="/organizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-indigo-600 rounded-md hover:bg-gray-50"
                >
                  Organizer Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-indigo-600 rounded-md hover:bg-gray-50"
                >
                  Admin Console
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-800 rounded-md hover:bg-gray-50"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
