'use client';
import React, { useState, useEffect, useCallback } from 'react';
import BlockSeatCard from './BlockSeatCard';
import BlockSeatForm from './BlockSeatForm';
import { Plus, Search, Filter, Plane, Loader2, AlertTriangle } from 'lucide-react';
import { BlockSeat } from './mockData';

// Helper to get auth token
const getAuthToken = () => {
  return document.cookie
    .split('; ')
    .find(r => r.startsWith('authToken='))
    ?.split('=')[1] || localStorage.getItem('authToken');
};

// Helper to map API data to frontend BlockSeat type
const mapApiDataToBlockSeat = (apiData: any[]): BlockSeat[] => {
  const mapClassName = (classId: number): 'Economy' | 'Business' | 'First' => {
    if (classId === 1) return 'Economy';
    if (classId === 2) return 'Business';
    if (classId === 3) return 'First';
    return 'Economy'; // Default for classId 4 or others
  };

  return apiData.map(item => ({
    id: item._id,
    airline: {
      name: item.airline.name,
      code: item.airline.code,
      country: item.airline.country,
      logo: `https://images.kiwi.com/airlines/64/${item.airline.code}.png`,
      flagCode: item.airline.country,
    },
    flightNumber: item.flightNumber || `${item.airline.code}${Math.floor(1000 + Math.random() * 9000)}`,
    route: {
      from: [{
        code: item.route.from.iataCode,
        city: item.route.from.city || item.route.from.iataCode,
        country: item.route.from.country,
        flag: '',
      }],
      to: [{
        code: item.route.to.iataCode,
        city: item.route.to.city || item.route.to.iataCode,
        country: item.route.to.country,
        flag: '',
      }],
      isRoundTrip: item.route.tripType === 'ROUND_TRIP',
      departure: item.availableDates?.[0]?.departureDate || '',
      return: item.availableDates?.[0]?.returnDate || '',
    },
    departureDate: item.availableDates?.[0]?.departureDate || new Date().toISOString(),
    departureTime: item.departureTime || '14:30',
    arrivalTime: item.arrivalTime || '17:45',
    duration: item.duration || '3h 15m',
    aircraft: item.aircraft || 'Boeing 737',
    priceClasses: item.classes.map((cls: any) => ({
      classType: mapClassName(cls.classId),
      price: cls.price,
      availableSeats: cls.availableSeats,
      totalSeats: cls.totalSeats,
      baggageAllowance: {
        checkedBag: `${item.baggageAllowance.checkedBags}x${item.baggageAllowance.weightPerBag}`,
        handBag: item.baggageAllowance.carryOnWeight,
        weight: `${item.baggageAllowance.weightPerBag} total`,
      },
      fareRules: {
        refundable: item.fareRules.refundable,
        changeable: true,
        changeFee: item.fareRules.changeFee,
        cancellationFee: item.fareRules.cancellationFee,
      },
    })),
    pricing: {
        economy: item.classes.find((c: any) => c.classId === 1)?.price || 0,
        business: item.classes.find((c: any) => c.classId === 2)?.price || 0,
        first: item.classes.find((c: any) => c.classId === 3)?.price || 0,
    },
    availability: {
        class1: {
            total: item.classes.find((c: any) => c.classId === 1)?.totalSeats || 0,
            booked: item.classes.find((c: any) => c.classId === 1)?.bookedSeats || 0,
        },
        class2: {
            total: item.classes.find((c: any) => c.classId === 2)?.totalSeats || 0,
            booked: item.classes.find((c: any) => c.classId === 2)?.bookedSeats || 0,
        },
        class3: {
            total: item.classes.find((c: any) => c.classId === 3)?.totalSeats || 0,
            booked: item.classes.find((c: any) => c.classId === 3)?.bookedSeats || 0,
        },
    },
    baggage: {
        checkedBags: item.baggageAllowance.checkedBags,
        weight: parseInt(item.baggageAllowance.weightPerBag),
        carryOn: parseInt(item.baggageAllowance.carryOnWeight),
    },
    fareRules: item.fareRules,
    supplierCommission: item.commission.supplierCommission,
    agencyCommission: item.commission.agencyCommission,
    availableDates: item.availableDates.map((d: any, index: number) => ({
        id: `${item._id}-${index}`,
        departure: d.departureDate,
        return: d.returnDate || '',
    })),
    status: item.status,
    createdAt: item.createdAt,
    validUntil: item.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: item.updatedAt,
  }));
};


const BlockSeatsModule = () => {
  const [blockSeats, setBlockSeats] = useState<BlockSeat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBlockSeat, setSelectedBlockSeat] = useState<BlockSeat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // State for delete confirmation modal
  const [seatToDeleteId, setSeatToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  
  const fetchBlockSeats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_FLIGHT_URL}block-seats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const mappedData = mapApiDataToBlockSeat(result.data);
        setBlockSeats(mappedData);
      } else {
        throw new Error(result.message || "Invalid data structure received from API.");
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockSeats();
  }, [fetchBlockSeats]);

  const filteredBlockSeats = blockSeats.filter(seat => {
    const fromLocation = Array.isArray(seat.route.from) ? seat.route.from.map(f => `${f.city} ${f.code}`).join(' ') : String(seat.route.from);
    const toLocation = Array.isArray(seat.route.to) ? seat.route.to.map(t => `${t.city} ${t.code}`).join(' ') : String(seat.route.to);
    
    const matchesSearch =
      seat.airline?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      toLocation.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterStatus === 'all' || seat.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const openDeleteModal = (id: string) => {
    setSeatToDeleteId(id);
  };

  const closeDeleteModal = () => {
    setSeatToDeleteId(null);
    setDeleteConfirmationText(''); // Reset on close
  };

  const handleConfirmDelete = async () => {
    if (!seatToDeleteId || deleteConfirmationText !== 'yes') return;

    setIsDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication token not found.");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_FLIGHT_URL}block-seats/${seatToDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete block seat.'}));
        throw new Error(errorData.message);
      }
      
      await fetchBlockSeats();
      closeDeleteModal();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(`Error deleting seat: ${err.message}`);
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSaveSuccess = () => {
    setShowAddForm(false);
    setSelectedBlockSeat(null);
    fetchBlockSeats();
  };

  if (showAddForm) {
    return <BlockSeatForm 
      onClose={() => setShowAddForm(false)} 
      onSave={handleSaveSuccess} />;
  }
  
  if (selectedBlockSeat) {
    return <BlockSeatForm
      blockSeat={selectedBlockSeat}
      onClose={() => setSelectedBlockSeat(null)}
      onSave={handleSaveSuccess}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Block Seats Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage flight inventory and pricing</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-gradient"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Block Seats
        </button>
      </div>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by flight number, airline, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-modern pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-modern w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="Sold Out">Sold Out</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {isLoading ? (
        <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Block Seats...</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait a moment.</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Failed to Load Data</h3>
            <p className="text-red-600 dark:text-red-500">{error}</p>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredBlockSeats.map(seat => (
                <BlockSeatCard
                    key={seat.id}
                    blockSeat={seat}
                    onEdit={setSelectedBlockSeat}
                    onDelete={openDeleteModal}
                />
                ))}
            </div>
            {filteredBlockSeats.length === 0 && (
                <div className="text-center py-12">
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Block Seats Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first block seats'
                    }
                </p>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-gradient"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Block Seats
                </button>
                </div>
            )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {seatToDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-4 text-left flex-1">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                            Delete Block Seat
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This action is permanent. To confirm, please type <strong className="text-red-600 dark:text-red-400">yes</strong> in the box below.
                            </p>
                        </div>
                        <div className="mt-4">
                           <input
                             type="text"
                             value={deleteConfirmationText}
                             onChange={(e) => setDeleteConfirmationText(e.target.value)}
                             placeholder='Type "yes" to confirm'
                             className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm rounded-none"
                           />
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleConfirmDelete}
                        disabled={deleteConfirmationText !== 'yes' || isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                Deleting...
                            </>
                        ) : (
                            'Yes, delete'
                        )}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={closeDeleteModal}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BlockSeatsModule;