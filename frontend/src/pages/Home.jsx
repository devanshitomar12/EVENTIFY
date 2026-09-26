import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { EventGridSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Music,
  Cpu,
  Trophy,
  Briefcase,
  GraduationCap,
  Film,
  Hammer,
  Users,
  Ticket,
  BarChart2,
  QrCode
} from 'lucide-react';

const categories = [
  { name: 'Technology', icon: Cpu },
  { name: 'Music', icon: Music },
  { name: 'Sports', icon: Trophy },
  { name: 'Business', icon: Briefcase },
  { name: 'Workshops', icon: Hammer },
  { name: 'Conferences', icon: Users },
  { name: 'Entertainment', icon: Film },
  { name: 'Education', icon: GraduationCap }
];

const popularTags = ['Music', 'Technology', 'Sports', 'Workshops', 'Business'];

// Real high-resolution event photograph (live crowd at concert / venue with authentic atmosphere)
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=2400&q=80';

const Home = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Parallax scroll state
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Subtle parallax on desktop/tablet only, static on mobile
          if (window.innerWidth >= 768) {
            const scrollY = window.scrollY;
            // Only calculate while hero is in or near viewport
            if (scrollY <= 800) {
              // Image moves slightly upward (slower than foreground scroll)
              setParallaxOffset(scrollY * 0.22);
            }
          } else {
            setParallaxOffset(0);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchHomeEvents = async () => {
      try {
        setLoading(true);
        const [featuredRes, trendingRes, upcomingRes] = await Promise.all([
          api.get('/events?featured=true&limit=1'),
          api.get('/events?sort=popularity&limit=3'),
          api.get('/events?sort=date&limit=6')
        ]);

        if (featuredRes.success) setFeaturedEvents(featuredRes.data);
        if (trendingRes.success) setTrendingEvents(trendingRes.data);
        if (upcomingRes.success) setUpcomingEvents(upcomingRes.data);
      } catch (err) {
        console.error('Failed to load home events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeEvents();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCity && selectedCity !== 'All') params.append('city', selectedCity);
    navigate(`/events?${params.toString()}`);
  };

  const featuredEvent = featuredEvents[0] || null;

  return (
    <div className="bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION WITH REAL EVENT PHOTOGRAPH & PARALLAX EFFECT    */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-center justify-center border-b border-gray-200">
        {/* Parallax Photographic Background Layer */}
        <div
          className="absolute inset-x-0 -top-12 -bottom-16 w-full h-[calc(100%+112px)] pointer-events-none"
          style={{
            transform: `translate3d(0, -${parallaxOffset}px, 0)`,
            willChange: 'transform',
            transition: 'transform 0.05s linear'
          }}
          aria-hidden="true"
        >
          <img
            src={HERO_IMAGE_URL}
            alt="Live concert and event atmosphere"
            className="w-full h-full object-cover object-center filter brightness-95"
            loading="eager"
          />
        </div>

        {/* Restrained Dark Overlay for optimal readability */}
        <div
          className="absolute inset-0 bg-slate-950/65 backdrop-contrast-105 pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero Foreground Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Find events you'll actually want to attend.
          </h1>
          <p className="mt-3.5 text-base sm:text-lg text-gray-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover concerts, conferences, workshops, sports and experiences happening near you.
          </p>

          {/* Compact Search Bar Card */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 rounded-xl shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, artists or topics..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>

              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              <div className="relative w-full sm:w-44 flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-9 pr-6 py-2.5 text-sm text-gray-700 bg-white focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Locations</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="New York">New York</option>
                  <option value="Denver">Denver</option>
                  <option value="Chicago">Chicago</option>
                  <option value="Seattle">Seattle</option>
                  <option value="Austin">Austin</option>
                  <option value="Boston">Boston</option>
                  <option value="Los Angeles">Los Angeles</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                Search
              </button>
            </form>

            {/* Popular categories below search */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-medium text-gray-300">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/events?category=${tag}`)}
                  className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-xs transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TRANSITION INTO CLEAN LIGHT SECTION: TRENDING EVENTS         */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Trending Events</h2>
            <p className="text-sm text-gray-500 mt-1">Popular events happening soon</p>
          </div>
          <Link
            to="/events?sort=popularity"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <EventGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* POPULAR CATEGORIES                                           */}
      {/* ============================================================ */}
      <section className="bg-gray-50/70 border-t border-b border-gray-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Browse by Category
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore experiences by interest</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/events?category=${cat.name}`}
                  className="flex flex-col items-center justify-center p-3.5 rounded-lg border border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 text-gray-700 hover:text-brand-600 transition-all text-center group shadow-xs"
                >
                  <div className="w-8 h-8 rounded-md bg-gray-100 group-hover:bg-brand-100 text-gray-600 group-hover:text-brand-600 flex items-center justify-center mb-2 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* EDITORIAL FEATURED EVENT BANNER                              */}
      {/* ============================================================ */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-sm flex flex-col lg:flex-row items-center">
            {/* Left Image (50%) */}
            <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-96 relative overflow-hidden bg-gray-800">
              <img
                src={featuredEvent.image}
                alt={featuredEvent.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/95 text-gray-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                  Featured
                </span>
              </div>
            </div>

            {/* Right Information (50%) */}
            <div className="w-full lg:w-1/2 p-6 sm:p-10 text-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  {featuredEvent.category}
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1.5 leading-tight">
                  {featuredEvent.title}
                </h3>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {featuredEvent.venue}, {featuredEvent.city}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-300 line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Tickets</span>
                  <span className="text-xl font-bold text-white">
                    {featuredEvent.startingPrice ? `From ₹${featuredEvent.startingPrice}` : 'Free Admission'}
                  </span>
                </div>

                <Link
                  to={`/events/${featuredEvent._id}`}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <span>View Event</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* UPCOMING NEAR YOU                                            */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Upcoming Events</h2>
            <p className="text-sm text-gray-500 mt-1">Explore events taking place soon</p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Browse directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <EventGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* FOR ORGANIZERS SECTION                                       */}
      {/* ============================================================ */}
      <section className="bg-gray-50 border-t border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Planning an event?
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Create events, manage registrations and track ticket sales from one dashboard.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/register"
                className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                Create an Event
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
              >
                Organizer Sign In
              </Link>
            </div>
          </div>

          {/* Three Feature Pillars */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <Ticket className="w-5 h-5 text-brand-600 mb-2.5" />
              <h3 className="font-semibold text-gray-900 text-sm">Multi-Tier Ticketing</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Configure General, VIP, or Early Bird tickets with reserved capacities and custom pricing.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <QrCode className="w-5 h-5 text-brand-600 mb-2.5" />
              <h3 className="font-semibold text-gray-900 text-sm">Fast Check-In</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Attendees receive verifiable QR passes on booking for fast check-in on arrival.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <BarChart2 className="w-5 h-5 text-brand-600 mb-2.5" />
              <h3 className="font-semibold text-gray-900 text-sm">Sales Analytics</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Monitor ticket volume, revenue per tier, and attendee lists directly from your portal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
