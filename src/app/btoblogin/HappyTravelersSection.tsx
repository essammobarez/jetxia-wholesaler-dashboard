import React from 'react';
import Image from 'next/image';
import { FaArrowLeft, FaArrowRight, FaStar } from 'react-icons/fa'; // Importing icons

export function HappyTravelersSection() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Hear from Our Happy Travelers
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          Our travelers&apos; tales are the true measure of our service. Read through heartfelt
          stories and rave reviews from our community members who&apos;ve turned their
          travel dreams into reality with NorthSide.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Testimonial */}
          <div className="text-left  p-8 rounded-xl  relative z-10">
            <p className="text-gray-700 text-lg mb-6">
              &quot;Booking my trip through NorthSide was a breeze! From finding the perfect hotel to
              securing the best flight deals, everything was seamless and stress-free.&quot;
            </p>
            <p className="font-semibold text-gray-900 text-base">
              - Sarah Dylan, USA
            </p>
            <div className="flex items-center mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <FaStar className="h-4 w-4 text-blue-500 mr-1" /> 4.7
              </span>
              <div className="flex space-x-4 ml-[380px]">
                <button className="text-blue-600 hover:text-blue-800 transition-colors">
                  <FaArrowLeft className="h-8 w-8" />
                </button>
                <button className="text-blue-600 hover:text-blue-800 transition-colors ">
                  <FaArrowRight className="h-8 w-8 " />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: World Map with Traveler Faces (as a single image) */}
          <div className="relative -mt-20 w-full h-[400px] lg:h-[500px]">
            <Image
              src="/images/map.png" // This is the single image for the map
              alt="World Map with Travelers"
              layout="fill"
              objectFit="contain"
              priority
            />
            {/* If the individual faces on the map in the image are part of the 'world-map-travelers.png' asset itself,
                then no further absolute positioning of small images is needed here.
                The commented-out section below is for if you wanted to overlay separate face images.
            */}
            {/* <div className="absolute top-[10%] left-[20%]">
                 <Image src="/images/traveler-face1.png" alt="Traveler 1" width={50} height={50} className="rounded-full" />
            </div> */}
            {/* ... more traveler faces positioned absolutely ... */}
          </div>
        </div>
      </div>
    </div>
  );
}