import React from 'react';
// Import icons from a specific library, e.g., Font Awesome or Ionicons
import { FaPlane, FaSuitcase, FaTicketAlt } from 'react-icons/fa'; // Using Font Awesome for example

export function ProductShowcaseSection() {
  const products = [
    {
      icon: <FaPlane className="h-8 w-8 text-blue-600" />,
      title: 'Easy Flights Reservation',
      description: 'Set Your Flights Higher - Our extensive network of airline partners offers you the freedom to fly how you want, where you want. With real-time price comparisons and a plethora of options, your ideal flight is at your fingertips.',
    },
    {
      icon: <FaSuitcase className="h-8 w-8 text-blue-600" />,
      title: 'Seamless Hotel Booking',
      description: 'Discover accommodations that are more than just a place to sleep: they\'re a part of the whole adventure. Whether it\'s a hotel in the city or a tranquil beachside resort, we connect you with places that elevate your travel experience.',
    },
    {
      icon: <FaTicketAlt className="h-8 w-8 text-blue-600" />,
      title: 'Shows and Events Tickets',
      description: 'Front Row to the World\'s Stage - Immerse yourself in the local culture with our wide selection of shows and events. From high-energy concerts to intimate local theater, we bring the best of entertainment to you.',
    },
    {
      icon: <FaTicketAlt className="h-8 w-8 text-blue-600" />,
      title: 'Shows and Events Tickets',
      description: 'Front Row to the World\'s Stage - Immerse yourself in the local culture with our wide selection of shows and events. From high-energy concerts to intimate local theater, we bring the best of entertainment to you.',
    },
  ];

  return (
    <div className="bg-[#132d58] w-full py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          All the products you want to grow <br /> your business
        </h2>
        <p className="text-lg text-blue-200 mb-12 max-w-3xl mx-auto">
          No more reaching out to all those suppliers for that destination or product. One platform for
          all your customer&apos;s need.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div
              key={index}
              className="group flex flex-col items-center p-6 bg-[#132d58] rounded-lg transition-shadow duration-300 hover:shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-center h-12 w-14 bg-white rounded-md">
                {product.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{product.title}</h3>
              <p className="text-blue-200 text-sm">{product.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
