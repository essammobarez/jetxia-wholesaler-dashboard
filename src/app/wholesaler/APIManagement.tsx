import type { NextPage } from 'next';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

// === Types ===
type MappedSupplier = {
  supplier: string;
  supplierHotelId: string;
  source: string;
  _id: string;
};

type Hotel = {
  _id: string;
  name: string;
  address: string;
  telephone: string;
  zipCode: string;
  country: {
    id: string;
    name: string;
    iso: string;
  };
  city: {
    id: number;
    name: string;
    countryId: string;
  };
  coordinates: {
    type: string;
    coordinates: number[];
  };
  stars: number;
  boardBasis: string[];
  facilities: {
    id: number;
    name: string;
    _id: string;
  }[];
  mainImageUrl: string;
  mappedSuppliers: MappedSupplier[];
};

// === Modal: Hotel Detail ===
const HotelDetailModal = ({ hotel, onClose }: { hotel: Hotel | null; onClose: () => void }) => {
  if (!hotel) return null;

  const getHighResImageUrl = (url: string) => {
    if (url && url.includes('_t.jpg')) {
      return url.replace('_t.jpg', '_z.jpg');
    }
    return url || '/images/placeholder.jpg';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 w-full">
          <Image
            src={getHighResImageUrl(hotel.mainImageUrl)}
            alt={hotel.name}
            fill
            className="object-cover rounded-t-lg"
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white rounded-full p-2 text-xl leading-none"
            aria-label="Close modal"
          >
            <IoClose />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900">{hotel.name}</h2>
          <div className="flex items-center mt-1">
            <span className="text-yellow-500">{'⭐'.repeat(Math.round(hotel.stars))}</span>
            <span className="ml-2 text-sm text-gray-500">({hotel.stars.toFixed(1)}-Star Hotel)</span>
          </div>
          <p className="text-md text-gray-700 mt-2">
            📍 {hotel.address}, {hotel.city.name}, {hotel.country.name}, {hotel.zipCode}
          </p>
          <p className="text-md text-gray-700 mt-1">📞 {hotel.telephone}</p>

          {/* Facilities */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Facilities</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.facilities.map((facility) => (
                <span
                  key={facility._id}
                  className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full"
                >
                  {facility.name}
                </span>
              ))}
            </div>
          </div>

          {/* Board Basis */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Board Basis</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.boardBasis.map((basis, index) => (
                <span
                  key={index}
                  className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
                >
                  {basis}
                </span>
              ))}
            </div>
          </div>

          {/* Mapped Suppliers */}
          {hotel.mappedSuppliers && hotel.mappedSuppliers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Mapped Suppliers</h3>
              <div className="space-y-3">
                {hotel.mappedSuppliers.map((supplier) => (
                  <div
                    key={supplier._id}
                    className="bg-gray-100 p-3 rounded-lg border border-gray-200"
                  >
                    <p className="text-md font-semibold text-gray-900 capitalize">
                      Source: <span className="font-normal">{supplier.source}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Supplier Hotel ID:{' '}
                      <code className="bg-gray-200 px-1 rounded">{supplier.supplierHotelId}</code>
                    </p>
                    <p className="text-sm text-gray-600">
                      Supplier: <code className="bg-gray-200 px-1 rounded">{supplier.supplier}</code>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === Modal: All Facilities ===
const FacilitiesModal = ({
  facilities,
  onClose,
}: {
  facilities: Hotel['facilities'] | null;
  onClose: () => void;
}) => {
  if (!facilities) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-800">All Facilities ({facilities.length})</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 text-3xl leading-none"
              aria-label="Close"
            >
              <IoClose />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto -mr-2 pr-2">
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility) => (
                <span
                  key={facility._id}
                  className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full"
                >
                  {facility.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Main Page Component ===
const HotelListPage: NextPage = () => {
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [facilitiesToShow, setFacilitiesToShow] = useState<Hotel['facilities'] | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/hotel-master/hotels/multiple-suppliers`
        );
        if (!response.ok) throw new Error('Failed to fetch data.');
        const result: { success: boolean; data: Hotel[] } = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAllHotels(result.data);
        } else {
          throw new Error('Invalid data format received.');
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const getHighResImageUrl = (url: string) => {
    if (url && url.includes('_t.jpg')) {
      return url.replace('_t.jpg', '_z.jpg');
    }
    return url || '/images/placeholder.jpg';
  };

  const handleClearSearch = () => setSearchTerm('');

  const filteredHotels = allHotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${hotel.city.name}, ${hotel.country.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <main className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Mapped Hotel 🏨</h1>
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search hotels or cities..."
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
                  ×
                </button>
              )}
            </div>
          </header>

          {/* Loading */}
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">Loading hotels...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 bg-red-100 text-red-700 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-4 text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold">{filteredHotels.length}</span> out of{' '}
                <span className="font-semibold">{allHotels.length}</span> hotels
              </div>

              {/* Hotel Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map((hotel, index) => (
                  <div
                    key={hotel._id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Image Section */}
                      <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
                        <Image
                          src={getHighResImageUrl(hotel.mainImageUrl)}
                          alt={hotel.name}
                          fill
                          className="object-cover"
                          quality={90}
                          priority={index < 3}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                          ⭐ {hotel.stars.toFixed(1)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h2 className="text-xl font-bold text-gray-800 truncate">{hotel.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {hotel.city.name}, {hotel.country.name}
                        </p>

                        {/* Facilities Preview */}
                        <div className="mt-3 flex flex-wrap gap-1 items-center">
                          {hotel.facilities.slice(0, 3).map((facility) => (
                            <span
                              key={facility._id}
                              className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                            >
                              {facility.name}
                            </span>
                          ))}
                          {hotel.facilities.length > 3 && (
                            <button
                              onClick={() => setFacilitiesToShow(hotel.facilities)}
                              className="text-xs font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-300"
                            >
                              +{hotel.facilities.length - 3} more
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => setSelectedHotel(hotel)}
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <HotelDetailModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />
      <FacilitiesModal facilities={facilitiesToShow} onClose={() => setFacilitiesToShow(null)} />
    </>
  );
};

export default HotelListPage;