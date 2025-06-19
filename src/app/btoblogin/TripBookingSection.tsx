import React from 'react';
import Image from 'next/image';
import { FaMapMarkerAlt, FaThumbsUp, FaStar } from 'react-icons/fa';
export function TripBookingSection() {
  const steps = [
    {
      number: 1,
      title: 'Browse and Select',
      description: 'Explore our wide range of destinations, accommodations, and activities, then choose the perfect options for your trip.',
    },
    {
      number: 2,
      title: 'Customize Your Experience',
      description: 'Tailor your trip to your preferences with our flexible booking options, add-ons, upgrades, and your personal preferences.',
    },
    {
      number: 3,
      title: 'Secure Your Booking',
      description: 'Complete your reservation securely and conveniently by using our best-reviewed and top-trusted payment methods.',
    },
    {
      number: 4,
      title: 'Enjoy Your Journey',
      description: 'Pack your bags and get ready for an unforgettable adventure. With your trip booked in just a few easy steps, all that’s left to do is enjoy the journey.',
    },
  ];

  return (
    <div className=" py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Section: Text Content and Steps */}
        <div className="text-left">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Your Trip, Your Way <br /> Just a few clicks away
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-xl">
            Planning your next adventure has never been simpler. Follow these easy steps to
            book your dream trip with ease, and embark on a journey filled with peace and
            serenity:
          </p>

          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-base">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Image, Bag, and Testimonial */}
        <div className="relative flex justify-center items-center lg:justify-left">
          {/* Main Image */}
          <Image
            src="/images/man.png"
            alt="Man with Passport and Luggage"
            width={300}
            height={300}
            layout="intrinsic"
            objectFit="contain"
            priority
          />

          {/* Bag Image - bottom left of main image */}
          <div className="absolute -bottom-14 left-16 z-10 hidden lg:block">
            <Image
              src="/images/bag.png"
              alt="Travel Bag"
              width={200}
              height={180}
              objectFit="contain"
            />
          </div>

          {/* Airplane Background - subtle effect */}
          <div className="absolute top-20 right-0 mr-[40px] z-0 hidden lg:block">
            <Image
              src="/images/airplane.png"
              alt="Airplane illustration"
              width={200}
              height={180}
              objectFit="contain"
            />
          </div>

          {/* Maisie Adams Testimonial Card */}
            <div className="absolute -bottom-7 right-20 flex items-end z-10">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col space-y-4">
                {/* Profile Section with Location */}
                <div className="flex items-center space-x-4">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src="/images/profile-1.png"
                      alt="Maisie Adams Profile"
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                  {/* Name and Location */}
                  <div className="flex flex-col">
                    <p className="text-gray-900 font-semibold text-sm">
                      Maisie Adams
                    </p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>Indonesia</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-t border-gray-200" />

                {/* Bottom Row: Ratings Only */}
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-gray-50">
                    <FaStar />
                    <span>4.7</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-gray-50">
                    <FaThumbsUp />
                    <span>4.7</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
  );
}