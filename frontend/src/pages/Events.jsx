import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { EventGridSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

const categories = [
  'All',
  'Technology',
  'Music',
  'Sports',
  'Business',
  'Education',
  'Entertainment',
  'Workshops',
  'Conferences'
];

const cities = [
  'All',
  'San Francisco',
  'New York',
  'Denver',
  'Chicago',
  'Seattle',
  'Austin',
  'Boston',
  'Los Angeles'
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false
  });
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search.trim()) params.append('search', search.trim());
      if (category && category !== 'All') params.append('category', category);
      if (city && city !== 'All') params.append('city', city);
      if (sort) params.append('sort', sort);
      if (featuredOnly) params.append('featured', 'true');
      params.append('page', page.toString());
      params.append('limit', '9');

      setSearchParams(params, { replace: true });

      const res = await api.get(`/events?${params.toString()}`);
      if (res.success) {
        setEvents(res.data);
        if (res.meta) {
          setPagination(res.meta);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, city, sort, featuredOnly, page, setSearchParams]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCity('All');
    setSort('newest');
    setFeaturedOnly(false);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Top Header */}
      <div className="border-b border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Browse Events
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Discover upcoming conferences, workshops, concerts, and gatherings.
          </p>

          {/* Search and Filters Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center"
          >
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event name, topic or venue..."
                className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            {/* City Selector */}
            <div className="relative w-full md:w-44">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-sm text-gray-700 bg-white focus:outline-none appearance-none cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Locations' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            {/* Sort Selector */}
            <div className="w-full md:w-44">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="popularity">Sort: Most Popular</option>
                <option value="date">Sort: Upcoming Date</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors"
            >
              Filter
            </button>

            {(search || category !== 'All' || city !== 'All' || sort !== 'newest') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full md:w-auto text-gray-600 hover:text-gray-900 text-xs font-medium px-3 py-2 flex items-center justify-center gap-1"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </form>

          {/* Category Chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-gray-500">
            Showing <strong className="text-gray-900 font-semibold">{events.length}</strong> of{' '}
            <strong className="text-gray-900 font-semibold">{pagination.total}</strong> events
          </p>
        </div>

        {loading ? (
          <EventGridSkeleton count={9} />
        ) : events.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        page === pNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No events found</h3>
            <p className="text-xs text-gray-500 mt-1">
              No events matched your current search filters. Try clearing your filters or changing location.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
