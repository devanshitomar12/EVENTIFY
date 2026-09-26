import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center bg-gray-50">
      <div className="max-w-md space-y-6 bg-white border border-gray-200 rounded-xl p-8 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl font-extrabold text-gray-900 tracking-tight block">
            404
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-2">
            Page not found
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            The page, event, or ticket you were looking for doesn't exist or has been moved.
          </p>
        </div>

        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-semibold text-white shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
