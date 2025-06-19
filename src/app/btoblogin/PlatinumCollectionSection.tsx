// File: ./PlatinumCollectionSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export function PlatinumCollectionSection() {
  return (
    <section className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-6 md:p-12 my-8 mx-auto">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Platinum Collection
        </h2>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Discover The Platinum Collection - exclusive, handpicked hotels offering world-class service, luxurious amenities, and unforgettable experiences.
        </p>
        <Link
          href="/platinum-collection"
          className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-500 font-medium"
        >
          <span>Explore Collection</span>
          {/* Simple right arrow SVG */}
          <svg
            className="ml-1 h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
