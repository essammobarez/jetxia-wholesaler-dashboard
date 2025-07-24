import type { NextPage } from 'next';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IoClose, IoCloseCircle } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';

// === Types (Unchanged) ===
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

type SupplierHotelDetails = {
  hotelName: string;
  address: {
    fullAddress: string;
    city: string;
    countryCode: string;
  };
  starRating: number;
  contact: {
    phone: string;
    email: string;
  };
  descriptions?: {
    general?: string;
  };
  facilites: string[];
};

// === Component: Inline Supplier Detail Display (Unchanged) ===
const SupplierDataDisplay = ({ supplierId, hotelId }: { supplierId: string; hotelId: string }) => {
  const [details, setDetails] = useState<SupplierHotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supplierId || !hotelId) {
      setIsLoading(false);
      setError('Missing supplier or hotel ID.');
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}hotel/${supplierId}/${hotelId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch details.');
        }
        const result = await response.json();
        if (result.success && result.data) {
          setDetails(result.data);
        } else {
          throw new Error(result.message || 'Invalid data format received.');
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [supplierId, hotelId]);

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-300">
        Loading supplier data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 mt-3 pt-3 border-t border-gray-300">
        <span className="font-semibold">Error:</span> {error}
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-300 text-sm">
      <div className="space-y-1">
        <p className="font-semibold text-gray-800">{details.hotelName}</p>
        <div className="flex items-center">
          <span className="text-yellow-500">{'⭐'.repeat(Math.round(details.starRating))}</span>
          <span className="ml-2 text-xs text-gray-500">({details.starRating}-Star)</span>
        </div>
        <p className="text-gray-600 pt-1">📍 {details.address?.fullAddress || 'Address not available'}</p>
        <p className="text-gray-600">📞 {details.contact?.phone || 'Phone not available'}</p>
        <p className="text-gray-600">📧 {details.contact?.email || 'Email not available'}</p>
      </div>

      {details.facilites && details.facilites.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="font-medium text-gray-700 mb-1">Facilities:</p>
          <div className="flex flex-wrap gap-1">
            {details.facilites.slice(0, 5).map((facility, index) => (
              <span
                key={index}
                className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
              >
                {facility}
              </span>
            ))}
            {details.facilites.length > 5 && (
              <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                +{details.facilites.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// === Modal: Hotel Detail (UPDATED) ===
const HotelDetailModal = ({
  hotel,
  onClose,
  onRemoveSupplier,
}: {
  hotel: Hotel | null;
  onClose: () => void;
  onRemoveSupplier: (hotelId: string, supplierMappingId: string) => void;
}) => {
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

        {/* This div wraps the content sections, allowing for the sticky header below */}
        <div>
          {/* Sticky Header Section: This part scrolls up and sticks to the top */}
          <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">{hotel.name}</h2>
            <p className="text-sm text-gray-500 mt-2 font-mono">
              ID: <code className="bg-gray-200 px-1.5 py-0.5 rounded">{hotel._id}</code>
            </p>
            <div className="flex items-center mt-1">
              <span className="text-yellow-500">{'⭐'.repeat(Math.round(hotel.stars))}</span>
              <span className="ml-2 text-sm text-gray-500">({hotel.stars.toFixed(1)}-Star Hotel)</span>
            </div>
          </div>

          {/* Remainder of the Scrolling Content */}
          <div className="px-6 pb-6">
            <p className="text-md text-gray-700 mt-2">
              📍 {hotel.address}, {hotel.city.name}, {hotel.country.name}, {hotel.zipCode}
            </p>
            <p className="text-md text-gray-700 mt-1">📞 {hotel.telephone}</p>

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

            {hotel.mappedSuppliers && hotel.mappedSuppliers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">Mapped Suppliers</h3>
                <div className="space-y-3">
                  {hotel.mappedSuppliers.map((supplier) => (
                    <div
                      key={supplier._id}
                      className="bg-gray-100 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-md font-semibold text-blue-700 capitalize">
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
                        <button
                          onClick={() => onRemoveSupplier(hotel._id, supplier._id)}
                          className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors flex-shrink-0"
                          aria-label="Remove supplier"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <SupplierDataDisplay
                        supplierId={supplier.supplier}
                        hotelId={supplier.supplierHotelId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// === Modal: All Facilities (Unchanged) ===
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

// === Main Page Component (Unchanged) ===
const HotelListPage: NextPage = () => {
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [facilitiesToShow, setFacilitiesToShow] = useState<Hotel['facilities'] | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}hotel-master/mapped-hotels`);
        if (searchTerm.trim()) {
          url.searchParams.append('searchQuery', searchTerm.trim());
        }

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error('Failed to fetch data.');

        const result: { success: boolean; data: Hotel[] } = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setAllHotels(result.data);
        } else {
          throw new Error('Invalid data format received.');
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        setAllHotels([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchHotels();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleRemoveSupplier = async (hotelId: string, supplierMappingId: string) => {
    if (!confirm('Are you sure you want to remove this supplier mapping? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}hotel-master/${hotelId}/remove-supplier`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supplierMappingId }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to remove supplier.');
      }
      const updateSuppliers = (hotel: Hotel) => ({
        ...hotel,
        mappedSuppliers: hotel.mappedSuppliers.filter((s) => s._id !== supplierMappingId),
      });

      setAllHotels((prevHotels) => prevHotels.map((h) => (h._id === hotelId ? updateSuppliers(h) : h)));
      setSelectedHotel((prevSelected) =>
        prevSelected && prevSelected._id === hotelId ? updateSuppliers(prevSelected) : prevSelected
      );

      alert('Supplier mapping removed successfully!');
    } catch (err: any) {
      console.error('Error removing supplier:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const getHighResImageUrl = (url: string) => {
    if (url && url.includes('_t.jpg')) {
      return url.replace('_t.jpg', '_z.jpg');
    }
    return url || '/images/placeholder.jpg';
  };

  const handleClearSearch = () => setSearchTerm('');

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <main className="max-w-6xl mx-auto">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <IoCloseCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </header>

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
              <div className="mb-4 text-sm text-gray-600">
                Showing <span className="font-semibold">{allHotels.length}</span> hotels
              </div>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allHotels.map((hotel, index) => (
                  <div
                    key={hotel._id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
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
                      <div className="p-5">
                        <h2 className="text-xl font-bold text-gray-800 truncate">{hotel.name}</h2>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          ID: <code className="bg-gray-200 text-gray-500 px-1 rounded">{hotel._id}</code>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {hotel.city.name}, {hotel.country.name}
                        </p>
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
      <HotelDetailModal
        hotel={selectedHotel}
        onClose={() => setSelectedHotel(null)}
        onRemoveSupplier={handleRemoveSupplier}
      />
      <FacilitiesModal facilities={facilitiesToShow} onClose={() => setFacilitiesToShow(null)} />
    </>
  );
};

export default HotelListPage;