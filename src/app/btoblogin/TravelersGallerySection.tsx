import React from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt } from 'react-icons/fa';

export function TravelersGallerySection() {
  return (
    <div className="bg-white w-full py-16 px-4 sm:px-6 lg:px-8">
      {/* Outer grid: 1 column on small, 3 columns on lg+ */}
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left tall image */}
        <div className="relative w-[420px] ml-[60px] h-64 sm:h-80 md:h-96 lg:h-[610px] overflow-hidden shadow-md rounded-t-lg">
          <Image
            src="/images/t1.png"
            alt="Traveler at Japan Gate"
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-t-lg"
            priority
          />
        </div>

        {/* Center content + two small images */}
        <div className="flex flex-col items-center text-center">
          {/* Top: heading, location, description, button, pagination */}
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Travelers Photo &amp; Video Gallery
            </h2>
            <div className="flex items-center justify-center text-blue-600 mb-6">
              <FaMapMarkerAlt className="h-5 w-5 mr-2" />
              <p className="text-xl font-semibold">Tokyo</p>
            </div>
            <p className="text-base sm:text-lg text-gray-600 mb-8">
              Our travelers&apos; tales are the true measure of our service. Read through heartfelt stories and rave reviews from our community members who&apos;ve turned their travel dreams into reality with Jetixia.
            </p>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-16 rounded-sm focus:outline-none focus:shadow-outline transition duration-300 ease-in-out mb-8"
            >
              View All
            </button>
            {/* Pagination Dots */}
            <div className="flex justify-center space-x-2 mb-10">
              <span className="h-2 w-10 bg-blue-600"></span>
              <span className="h-2 w-4 bg-gray-300 "></span>
              <span className="h-2 w-4 bg-gray-300 "></span>
              <span className="h-2 w-4 bg-gray-300 "></span>
            </div>
          </div>

          {/* Two smaller images under the content, centered */}
          <div className="w-full mt-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative w-full h-40 sm:h-48 overflow-hidden shadow-md rounded-t-lg">
              <Image
                src="/images/t2.png"
                alt="Tokyo Canal"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg"
                priority
              />
            </div>
            <div className="relative w-full h-40 sm:h-48 overflow-hidden shadow-md rounded-t-lg">
              <Image
                src="/images/t3.png"
                alt="Tokyo Station"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg"
                priority
              />
            </div>
          </div>
        </div>

        {/* Right tall image */}
        <div className="relative w-[420px] -ml-2 h-64 sm:h-80 md:h-96 lg:h-[610px] overflow-hidden shadow-md rounded-t-lg">
          <Image
            src="/images/t4.png"
            alt="Tokyo Nightlife"
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-t-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
}
