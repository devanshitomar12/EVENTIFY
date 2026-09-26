import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Calendar className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Eventify
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed">
              Eventify connects people with live conferences, workshops, concerts, and gatherings worldwide.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {['Technology', 'Music', 'Business', 'Sports', 'Workshops', 'Conferences'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/events?category=${cat}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discovery Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-indigo-600 transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link to="/events?sort=popularity" className="hover:text-indigo-600 transition-colors">
                  Trending Events
                </Link>
              </li>
              <li>
                <Link to="/events?sort=date" className="hover:text-indigo-600 transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-indigo-600 transition-colors">
                  My Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Organizers
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/organizer" className="hover:text-indigo-600 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Sign In to Host
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-600 transition-colors">
                  Host an Event
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Eventify Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-700 cursor-pointer">Privacy</span>
            <span className="hover:text-gray-700 cursor-pointer">Terms</span>
            <span className="hover:text-gray-700 cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
