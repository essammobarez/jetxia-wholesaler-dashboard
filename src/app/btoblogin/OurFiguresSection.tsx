import React from 'react';
import Image from 'next/image';

export function OurFiguresSection() {
  const figuresData = [
    {
      title: '+11M',
      subtitle: 'Hotel Bookings',
      image: '/images/hotel1.png',
    },
    {
      title: '+11M',
      subtitle: 'Flight Bookings',
      image: '/images/flight-book.png',
    },
    {
      title: '+11M',
      subtitle: 'Travel Packages',
      image: '/images/travel-package.png',
    },
    {
      title: '+11M',
      subtitle: 'Trip Plan',
      image: '/images/trip-planer.png',
    },
    {
      title: '+11M',
      subtitle: 'Travel Agencies',
      image: '/images/travel-agency.png',
    },
  ];

  return (
    <div className="bg-white w-full py-16 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-12">Our Figures</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {figuresData.map((figure, index) => {
            // For the last item, span two columns on large screens
            const spanClass = index === figuresData.length - 1 ? 'lg:col-span-2' : '';

            return (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden shadow-lg h-64 flex items-end p-6 ${spanClass}`}
              >
                <Image
                  src={figure.image}
                  alt={figure.subtitle}
                  layout="fill"
                  objectFit="cover"
                  className="absolute inset-0 z-0"
                  priority
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
                <div className="relative z-20 text-left text-white">
                  <h3 className="text-4xl font-extrabold mb-1">{figure.title}</h3>
                  <p className="text-lg font-semibold">{figure.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
