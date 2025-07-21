import type { NextPage } from 'next';
import Image from 'next/image';
import { useState } from 'react';

// Types
type Hotel = {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  amenities: string[];
  description: string;
};

// Updated hotel list
const allHotels: Hotel[] = [
  {
    id: 1,
    name: 'Grand Hyatt',
    location: 'New York, USA',
    imageUrl: '/images/hotel1.png',
    rating: 4.7,
    amenities: ['Pool', 'Spa', 'Pet Friendly'],
    description: 'Luxurious hotel in the heart of Manhattan.',
  },
  {
    id: 2,
    name: 'The Ritz-Carlton',
    location: 'Tokyo, Japan',
    imageUrl: '/images/hotel1.png',
    rating: 4.9,
    amenities: ['Spa', 'Free WiFi', 'Gym'],
    description: 'Elegant luxury hotel with skyline views.',
  },
  {
    id: 3,
    name: 'Burj Al Arab',
    location: 'Dubai, UAE',
    imageUrl: '/images/hotel1.png',
    rating: 5.0,
    amenities: ['Private Beach', 'Pool', 'Butler Service'],
    description: 'Iconic sail-shaped hotel offering world-class service.',
  },
  {
    id: 4,
    name: 'Four Seasons',
    location: 'Paris, France',
    imageUrl: '/images/hotel1.png',
    rating: 4.8,
    amenities: ['Michelin Star', 'Spa', 'Free WiFi'],
    description: 'Timeless elegance in the heart of Paris.',
  },
  {
    id: 5,
    name: 'Mandarin Oriental',
    location: 'Bangkok, Thailand',
    imageUrl: '/images/hotel1.png',
    rating: 4.9,
    amenities: ['River View', 'Pool', 'Gym'],
    description: 'Lavish riverside retreat with panoramic views.',
  },
  {
    id: 6,
    name: 'The Savoy',
    location: 'London, UK',
    imageUrl: '/images/hotel1.png',
    rating: 4.6,
    amenities: ['Historic', 'Bar', 'Free WiFi'],
    description: 'A historic hotel with modern luxury in London.',
  },
];

const HotelListPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const filteredHotels = allHotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <main className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Mapped Hotel  🏨</h1>
           
          </div>

          {/* Search Bar - Left Aligned */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-4 pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </header>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredHotels.length}</span> out of <span className="font-semibold">{allHotels.length}</span> hotels
        </div>

        {/* Hotel Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                  ⭐ {hotel.rating.toFixed(1)}
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800">{hotel.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{hotel.location}</p>

                <p className="mt-2 text-gray-600 text-sm line-clamp-2">{hotel.description}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {hotel.amenities.map((amenity, idx) => (
                    <span key={idx} className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default HotelListPage;