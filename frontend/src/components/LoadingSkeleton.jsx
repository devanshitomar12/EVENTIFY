import React from 'react';

export const EventCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-gray-200 w-full"></div>
    <div className="p-4 space-y-3">
      <div className="h-3 w-20 bg-gray-200 rounded"></div>
      <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
      <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="h-3 w-16 bg-gray-100 rounded"></div>
        <div className="h-4 w-14 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export const EventGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="w-full bg-white rounded-xl border border-gray-200 p-4 space-y-4 animate-pulse">
    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
      <div className="h-5 w-32 bg-gray-200 rounded"></div>
      <div className="h-8 w-24 bg-gray-100 rounded"></div>
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-4 bg-gray-100 rounded flex-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default EventGridSkeleton;
