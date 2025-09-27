'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Download, Filter, Search, Building2, Eye, FileText } from 'lucide-react';

interface SupplierBooking {
  _id: string;
  bookingId: string;
  agency: {
    agencyName: string;
    _id: string;
  };
  supplier: {
    name: string;
    _id: string;
  };
  status: string;
  serviceDates: {
    startDate: string;
    endDate: string;
  };
  priceDetails: {
    originalPrice: {
      value: number;
      currency: string;
    };
    price: {
      value: number;
      currency: string;
    };
    markupApplied?: {
      type: string;
      value: number;
    };
  };
  rooms?: Array<{
    cancellationPolicy?: {
      policies?: Array<{
        charge?: {
          components?: {
            net?: {
              value: number;
              currency: string;
            };
          };
        };
      }>;
    };
  }>;
  bookingDate: string;
  vouchedDate?: string;
  cancelledDate?: string;
  wasVouched: boolean;
  // Provider information from booking overview
  provider?: {
    name?: string;
    _id?: string;
    supplierName?: string;
    supplierId?: string;
  };
  // Booking overview with provider details
  bookingOverview?: {
    provider?: {
      name?: string;
      _id?: string;
      supplierName?: string;
      supplierId?: string;
    };
  };
}

interface Supplier {
  _id: string;
  name: string;
  type?: 'Offline' | 'Online';
}

interface PaymentTransaction {
  _id: string;
  paymentId: string;
  agencyId: {
    _id: string;
    agencyName?: string;
    slug: string;
  };
  wholesalerId: string;
  ledgerEntryId: {
    _id: string;
    referenceType: string;
    referenceId: string;
    description: string;
  };
  fullAmount: number;
  paidAmount: number;
  status: string;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  supplier?: {
    name: string;
    _id: string;
  };
  agencyInfo?: {
    agencyName: string;
    _id: string;
  };
  currency?: string;
}

interface StatementEntry {
  _id: string;
  type: 'booking' | 'payment';
  date: string;
  reference: string;
  description: string;
  supplier: {
    name: string;
    _id: string;
  };
  agency: {
    agencyName: string;
    _id: string;
  };
  creditAmount?: number;
  debitAmount?: number;
  currency: string;
  status: string;
  originalData: SupplierBooking | PaymentTransaction;
}

const StatementsOnAccount = () => {
  const [bookings, setBookings] = useState<SupplierBooking[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date filtering
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Statement view
  const [selectedStatement, setSelectedStatement] = useState<StatementEntry | null>(null);
  const [fullBookingData, setFullBookingData] = useState<any>(null);
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);

  // Get wholesaler ID on mount
  useEffect(() => {
    const storedId = localStorage.getItem('wholesalerId');
    setWholesalerId(storedId);
  }, []);

  // Fetch complete booking details when a booking is selected
  const fetchFullBookingDetails = async (bookingId: string) => {
    if (!wholesalerId || !bookingId) return;
    
    setLoadingBookingDetails(true);
    try {
      console.log('Fetching full booking details for:', bookingId);
      
      // Try to fetch from booking details endpoint
      const detailsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/details/${bookingId}`
      );
      
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        console.log('Full booking details fetched:', detailsData);
        setFullBookingData(detailsData);
        return;
      }
      
      // Fallback: try to get from wholesaler bookings and find specific booking
      const wholesalerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/wholesaler/${wholesalerId}`
      );
      
      if (wholesalerResponse.ok) {
        const wholesalerData = await wholesalerResponse.json();
        const bookingsArray = Array.isArray(wholesalerData) ? wholesalerData : [wholesalerData];
        
        const specificBooking = bookingsArray.find((booking: any) => 
          booking.bookingId === bookingId || booking._id === bookingId
        );
        
        if (specificBooking) {
          console.log('Found specific booking in wholesaler data:', specificBooking);
          setFullBookingData(specificBooking);
        } else {
          console.warn('Booking not found in wholesaler data');
          setFullBookingData(null);
        }
      }
      
    } catch (error) {
      console.error('Error fetching full booking details:', error);
      setFullBookingData(null);
    } finally {
      setLoadingBookingDetails(false);
    }
  };

  // Handle statement selection and fetch full booking data
  const handleStatementSelection = async (statement: StatementEntry) => {
    setSelectedStatement(statement);
    setFullBookingData(null); // Reset previous data
    
    if (statement.type === 'booking' && statement.originalData && 'bookingId' in statement.originalData) {
      const bookingData = statement.originalData as SupplierBooking;
      const bookingId = bookingData.bookingId || bookingData._id;
      await fetchFullBookingDetails(bookingId);
    }
  };

  // Fetch suppliers and bookings
  useEffect(() => {
    if (!wholesalerId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch both offline and online suppliers
        const [offlineResponse, onlineResponse] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`)
        ]);

        const allSuppliers: Supplier[] = [];

        // Process offline suppliers
        if (offlineResponse.status === 'fulfilled' && offlineResponse.value.ok) {
          const offlineData = await offlineResponse.value.json();
          console.log('Raw offline supplier data:', offlineData);
          const offlineSuppliers: Supplier[] = (
            Array.isArray(offlineData) ? offlineData : offlineData.data || []
          ).map((supplier: any) => ({
            _id: supplier._id,
            name: supplier.name,
            type: 'Offline' as const
          }));
          allSuppliers.push(...offlineSuppliers);
        }

        // Process online suppliers
        if (onlineResponse.status === 'fulfilled' && onlineResponse.value.ok) {
          const onlineData = await onlineResponse.value.json();
          console.log('Raw online supplier data:', onlineData);
          const onlineSuppliers: Supplier[] = (
            Array.isArray(onlineData) ? onlineData : onlineData.data || []
          ).map((supplier: any) => ({
            _id: supplier._id,
            name: supplier.name,
            type: 'Online' as const
          }));
          allSuppliers.push(...onlineSuppliers);
        }

        // Fetch all bookings        // Sort suppliers by name for better UX
        allSuppliers.sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Debug - All suppliers (including booking suppliers):', allSuppliers.length);
        console.log('Debug - Sample suppliers:', allSuppliers.slice(0, 3));
        
        setSuppliers(allSuppliers);

        // Fetch all bookings
        const bookingsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/wholesaler/${wholesalerId}`
        );
        
        if (!bookingsResponse.ok) {
          throw new Error(`HTTP error! Status: ${bookingsResponse.status}`);
        }
        
        const bookingsData = await bookingsResponse.json();
        console.log('Raw booking response:', bookingsData);
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [bookingsData];
        
        // Include ALL bookings for statement purposes (not just vouched)
        // We'll show all bookings and let users filter by status
        const allBookings = bookingsArray.map((booking: any) => ({
          ...booking,
          wasVouched: ['confirmed', 'ok', 'vouched', 'booked'].includes(booking.status?.toLowerCase()) || 
                     booking.wasVouched || false
        }));

        // Debug: Log booking data
        console.log('Loaded bookings:', allBookings.length);
        console.log('Booking statuses:', Array.from(new Set(allBookings.map((b: any) => b.status))));
        
        // Debug: Log first booking structure in detail
        if (allBookings.length > 0) {
          console.log('First booking complete structure:', allBookings[0]);
          console.log('First booking keys:', Object.keys(allBookings[0]));
        }
        
        setBookings(allBookings);

        // Add suppliers from bookings that might not be in the supplier endpoints
        const bookingSuppliersSet = new Set();
        allBookings.forEach((booking: any) => {
          if (booking.supplier?.name && booking.supplier?.name !== 'E Booking') {
            const supplierKey = `${booking.supplier.name}-${booking.supplier._id}`;
            if (!bookingSuppliersSet.has(supplierKey)) {
              bookingSuppliersSet.add(supplierKey);
              
              // Check if this supplier is not already in our list
              const existingSupplier = allSuppliers.find(s => 
                s._id === booking.supplier._id || s.name === booking.supplier.name
              );
              
              if (!existingSupplier) {
                allSuppliers.push({
                  _id: booking.supplier._id,
                  name: booking.supplier.name,
                  type: undefined // No type for booking suppliers
                });
              }
            }
          }
        });
        
        // Sort suppliers by name for better UX
        allSuppliers.sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Debug - All suppliers (including booking suppliers):', allSuppliers.length);
        console.log('Debug - Sample suppliers:', allSuppliers.slice(0, 3));
        
        setSuppliers(allSuppliers);

        // Fetch payment transactions
        try {
          const paymentsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/wholesaler/${wholesalerId}?page=1&limit=1000`
          );
          
          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            const paymentsList = paymentsData?.data?.payments || [];
            
            // Filter completed payments and add supplier info
            const processedPayments = paymentsList
              .filter((payment: any) => payment.status === 'completed' || payment.status === 'paid')
              .map((payment: any) => {
                // Try to match payment to booking for supplier info
                const relatedBooking = allBookings.find((booking: any) => 
                  booking._id === payment.ledgerEntryId?.referenceId ||
                  booking.bookingId === payment.ledgerEntryId?.referenceId
                );
                
                // Get currency from related booking
                const paymentCurrency = relatedBooking?.priceDetails?.originalPrice?.currency || 
                                      relatedBooking?.priceDetails?.price?.currency || 
                                      'USD';
                
                return {
                  ...payment,
                  supplier: relatedBooking ? {
                    name: relatedBooking.bookingOverview?.provider?.name || 
                          relatedBooking.bookingOverview?.provider?.supplierName ||
                          relatedBooking.provider?.name ||
                          relatedBooking.provider?.supplierName ||
                          relatedBooking.supplier?.name || 
                          'Supplier Payment',
                    _id: relatedBooking.bookingOverview?.provider?._id ||
                         relatedBooking.bookingOverview?.provider?.supplierId ||
                         relatedBooking.provider?._id ||
                         relatedBooking.provider?.supplierId ||
                         relatedBooking.supplier?._id || 
                         'unknown'
                  } : {
                    name: 'Supplier Payment',
                    _id: 'unknown'
                  },
                  agencyInfo: {
                    agencyName: payment.agencyId?.agencyName || 'Unknown Agency',
                    _id: payment.agencyId?._id || 'unknown'
                  },
                  currency: paymentCurrency
                };
              });
            
            setPayments(processedPayments);
          }
        } catch (paymentError) {
          console.warn('Could not fetch payment data:', paymentError);
          setPayments([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
        setBookings([]);
        setSuppliers([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wholesalerId]);

  // Create combined statement entries from bookings and payments
  const statementEntries = useMemo(() => {
    const entries: StatementEntry[] = [];

    // Add booking entries (credits)
    bookings.forEach(booking => {
      const netRate = booking.priceDetails?.originalPrice?.value || 
                     booking.priceDetails?.price?.value ||
                     booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.value || 
                     0;
      const currency = booking.priceDetails?.originalPrice?.currency || 
                      booking.priceDetails?.price?.currency ||
                      booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.currency || 
                      'USD';
      const isCancelled = booking.status?.toLowerCase() === 'cancelled';
      
      // Read supplier info from various possible locations in the booking data
      const bookingAny = booking as any;
      
      // Enhanced debugging for supplier extraction
      console.log(`Processing booking ${booking.bookingId} for supplier info:`, {
        'booking.supplier': booking.supplier,
        'booking.provider': booking.provider,
        'booking.bookingOverview': booking.bookingOverview,
        'bookingAny.bookingData': bookingAny.bookingData,
        'bookingAny.serviceProvider': bookingAny.serviceProvider,
        'bookingAny.providerInfo': bookingAny.providerInfo,
        'allKeys': Object.keys(bookingAny)
      });
      
      // Enhanced debugging for supplier extraction
      console.log('🔍 Processing booking for supplier extraction:', booking.bookingId || booking._id);
      console.log('📊 Booking structure keys:', Object.keys(booking));
      if (booking.rooms) {
        console.log('🏨 Rooms array found:', booking.rooms.length, 'rooms');
        booking.rooms.forEach((room: any, index: number) => {
          console.log(`🏨 Room ${index}:`, Object.keys(room));
          if (room.provider) {
            console.log(`🎯 Room ${index} provider found:`, room.provider);
          }
        });
      }
      
      const supplierName = 
              // First priority: Check rooms array for provider (most reliable)
              (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0 && (booking.rooms[0] as any)?.provider?.name) ||
              // Second priority: Check booking overview provider
              booking.bookingOverview?.provider?.name || 
              booking.bookingOverview?.provider?.supplierName ||
              // Third priority: Direct provider/supplier fields
              booking.provider?.name ||
              booking.provider?.supplierName ||
              booking.supplier?.name ||
              // Check nested booking data structures
              bookingAny.bookingData?.provider?.name ||
              bookingAny.bookingData?.supplier?.name ||
              bookingAny.bookingData?.detailedInfo?.provider?.name ||
              bookingAny.bookingData?.detailedInfo?.supplier?.name ||
              // Check service provider info within detailed booking data
              bookingAny.bookingData?.detailedInfo?.service?.supplier?.name ||
              // Priority 1: Extract from rooms array (most reliable)
              (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0 && (booking.rooms[0] as any)?.provider?.name) ||
              // Priority 2: Check booking overview provider
              booking.bookingOverview?.provider?.name ||
              // Priority 3: Other possible nested structures
              bookingAny.serviceProvider?.name ||
              bookingAny.service?.provider?.name ||
              // Check hotel/accommodation provider
              bookingAny.hotel?.provider?.name ||
              bookingAny.accommodation?.provider?.name ||
              // Fallback to any name field in provider objects
              bookingAny.providerInfo?.name ||
              bookingAny.supplierInfo?.name ||
              'E Booking';
              
      const supplierId = 
              // First priority: Check rooms array for provider ID
              (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0 && (booking.rooms[0] as any)?.provider?._id) ||
              // Second priority: Check booking overview provider
              booking.bookingOverview?.provider?._id ||
              booking.bookingOverview?.provider?.supplierId ||
              // Third priority: Direct provider/supplier fields
              booking.provider?._id ||
              booking.provider?.supplierId ||
              booking.supplier?._id ||
              // Check nested booking data structures
              bookingAny.bookingData?.provider?._id ||
              bookingAny.bookingData?.supplier?._id ||
              bookingAny.bookingData?.detailedInfo?.provider?._id ||
              bookingAny.bookingData?.detailedInfo?.supplier?._id ||
              // Check service provider info
              bookingAny.serviceProvider?._id ||
              bookingAny.service?.provider?._id ||
              // Check hotel/accommodation provider
              bookingAny.hotel?.provider?._id ||
              bookingAny.accommodation?.provider?._id ||
              // Fallback to any id field in provider objects
              bookingAny.providerInfo?._id ||
              bookingAny.supplierInfo?._id ||
              booking._id;
      
      console.log(`Final supplier for ${booking.bookingId}:`, { name: supplierName, _id: supplierId });
      
      const supplierInfo = {
        name: supplierName,
        _id: supplierId
      };
      
      // Create entry for all bookings (not just vouched ones)
      entries.push({
        _id: booking._id,
        type: 'booking',
        date: booking.bookingDate || booking.serviceDates?.startDate || new Date().toISOString(),
        reference: booking.bookingId,
        description: isCancelled ? 'Booking Cancellation (Credit Reversal)' : 'Service Booking Revenue',
        supplier: supplierInfo,
        agency: booking.agency || { agencyName: 'Unknown Agency', _id: 'unknown' },
        creditAmount: !isCancelled && netRate > 0 ? netRate : undefined,
        debitAmount: isCancelled && netRate > 0 ? netRate : undefined,
        currency: currency,
        status: booking.status,
        originalData: booking
      });
    });

    // Add payment entries (debits)
    payments.forEach(payment => {
      entries.push({
        _id: payment._id,
        type: 'payment',
        date: payment.createdAt,
        reference: payment.paymentId,
        description: 'Supplier Payment',
        supplier: payment.supplier || { name: 'Multiple Suppliers', _id: 'payment' },
        agency: payment.agencyInfo || { agencyName: 'Payment', _id: 'payment' },
        creditAmount: undefined,
        debitAmount: payment.paidAmount,
        currency: payment.currency || 'USD',
        status: payment.status,
        originalData: payment
      });
    });

    // Sort by date (newest first)
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Debug: Log statement entries and supplier sources
    console.log('Statement entries created:', sortedEntries.length, '(bookings:', sortedEntries.filter(e => e.type === 'booking').length, 'payments:', sortedEntries.filter(e => e.type === 'payment').length, ')');
    
    // Debug: Log full booking structure and supplier information sources
    if (bookings.length > 0) {
      console.log('=== SUPPLIER DEBUGGING ===');
      console.log('Total bookings:', bookings.length);
      
      bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`\n--- Booking ${index + 1} (${booking.bookingId}) ---`);
        console.log('Full booking object:', JSON.stringify(booking, null, 2));
        console.log('Supplier field:', booking.supplier);
        console.log('Provider field:', booking.provider);
        console.log('BookingOverview field:', booking.bookingOverview);
        
        // Check for any field containing 'provider' or 'supplier' in the raw data
        const bookingAny = booking as any;
        const allFields = Object.keys(bookingAny);
        const providerFields = allFields.filter(key => 
          key.toLowerCase().includes('provider') || 
          key.toLowerCase().includes('supplier')
        );
        console.log('Fields containing provider/supplier:', providerFields);
        
        // Look for nested objects that might contain provider info
        Object.keys(bookingAny).forEach(key => {
          const value = bookingAny[key];
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const nestedKeys = Object.keys(value);
            const hasProviderInfo = nestedKeys.some(nKey => 
              nKey.toLowerCase().includes('provider') || 
              nKey.toLowerCase().includes('supplier') ||
              nKey.toLowerCase().includes('name')
            );
            if (hasProviderInfo) {
              console.log(`Nested object ${key} contains provider info:`, value);
            }
          }
        });
        
        const finalSupplier = {
          name: booking.bookingOverview?.provider?.name || 
                booking.bookingOverview?.provider?.supplierName ||
                booking.provider?.name ||
                booking.provider?.supplierName ||
                booking.supplier?.name || 
                'E Booking',
          _id: booking.bookingOverview?.provider?._id ||
               booking.bookingOverview?.provider?.supplierId ||
               booking.provider?._id ||
               booking.provider?.supplierId ||
               booking.supplier?._id || 
               booking._id
        };
        
        console.log('Final supplier result:', finalSupplier);
      });
      
      console.log('=== END SUPPLIER DEBUGGING ===');
    }
    
    return sortedEntries;
  }, [bookings, payments, suppliers]);

  // Filter statement entries based on selected criteria
  const filteredEntries = useMemo(() => {
    // Don't show any entries if no supplier is selected
    if (!selectedSupplier) {
      return [];
    }

    return statementEntries.filter(entry => {
      // DEBUG: Show all entries if debug option is selected
      if (selectedSupplier === 'DEBUG_ALL') {
        return true;
      }
      
      // Supplier filter - try multiple matching strategies
      const selectedSupplierInfo = suppliers.find(s => s._id === selectedSupplier);
      const supplierMatches = 
        entry.supplier?._id === selectedSupplier ||
        entry.supplier?.name === selectedSupplierInfo?.name ||
        // Also try to match by supplier name directly
        (entry.supplier?.name && selectedSupplierInfo?.name && 
         entry.supplier.name.toLowerCase().includes(selectedSupplierInfo.name.toLowerCase()));
      
      if (!supplierMatches) {
        return false;
      }

      // Date range filter
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < new Date(startDate)) {
        return false;
      }
      if (endDate && entryDate > new Date(endDate)) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = 
          entry.reference?.toLowerCase().includes(searchLower) ||
          entry.agency?.agencyName?.toLowerCase().includes(searchLower) ||
          entry.description?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter === 'vouched' && entry.type === 'booking' && 
          !['confirmed', 'ok', 'vouched', 'booked', 'active'].includes(entry.status?.toLowerCase())) {
        return false;
      }
      if (statusFilter === 'cancelled' && entry.type === 'booking' && 
          entry.status?.toLowerCase() !== 'cancelled') {
        return false;
      }

      return true;
    });
  }, [statementEntries, selectedSupplier, startDate, endDate, searchTerm, statusFilter]);

  // Calculate accounting statement summary
  const statementSummary = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      if (entry.creditAmount) {
        acc.totalCredits += entry.creditAmount;
        if (entry.type === 'booking') {
          acc.vouchedCount += 1;
        }
      }
      
      if (entry.debitAmount) {
        acc.totalDebits += entry.debitAmount;
        if (entry.type === 'booking') {
          acc.cancelledCount += 1;
        } else if (entry.type === 'payment') {
          acc.paymentCount += 1;
        }
      }
      
      // Track the most common currency in the entries
      if (entry.currency) {
        if (!acc.currencyCount) acc.currencyCount = {};
        acc.currencyCount[entry.currency] = (acc.currencyCount[entry.currency] || 0) + 1;
        
        // Set the currency to the most frequent one
        const currencies = Object.keys(acc.currencyCount);
        if (currencies.length > 0) {
          acc.currency = currencies.reduce((a, b) => 
            acc.currencyCount[a] > acc.currencyCount[b] ? a : b
          );
        }
      }
      
      return acc;
    }, {
      totalCredits: 0,
      totalDebits: 0,
      vouchedCount: 0,
      cancelledCount: 0,
      paymentCount: 0,
      currency: 'USD',
      currencyCount: {} as Record<string, number>
    });
  }, [filteredEntries]);

  const getNetRate = (booking: SupplierBooking): number => {
    return booking.priceDetails?.originalPrice?.value || 
           booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.value || 
           0;
  };

  const getCurrency = (booking: SupplierBooking): string => {
    return booking.priceDetails?.originalPrice?.currency || 
           booking.rooms?.[0]?.cancellationPolicy?.policies?.[0]?.charge?.components?.net?.currency || 
           'USD';
  };

  if (loading) {
    return (
      <div className="card-modern p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading supplier statements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-modern p-6 text-center bg-red-50 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-700 dark:text-red-400">Error Loading Statements</h3>
        <p className="mt-2 text-red-600 dark:text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="card-modern overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-orange-600" />
              Statement of Account
              {selectedSupplier && (
                <span className="text-lg text-orange-600">-</span>
              )}
              {selectedSupplier && suppliers.find(s => s._id === selectedSupplier) && (
                <span className="text-lg font-medium text-orange-600">
                  {suppliers.find(s => s._id === selectedSupplier)?.name}
                  <span className="text-sm font-normal ml-1">
                    ({suppliers.find(s => s._id === selectedSupplier)?.type})
                  </span>
                </span>
              )}
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {selectedSupplier 
                ? 'Detailed accounting ledger with credits (net rates) and debits (payments) for selected supplier'
                : 'Please select a supplier to view their statement of account'}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Download className="w-4 h-4" />
            Export Statement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Supplier Selection */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">-- Select a Supplier --</option>
              <option value="DEBUG_ALL" className="bg-yellow-100">🐛 DEBUG: Show All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name} {supplier.type ? `(${supplier.type})` : ''}
                </option>
              ))}
            </select>
            {!selectedSupplier && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                <p>Please select a supplier to view their statement</p>
                <p className="text-xs mt-1">
                  Found {suppliers.length} suppliers ({suppliers.filter(s => s.type === 'Offline').length} offline, {suppliers.filter(s => s.type === 'Online').length} online)
                </p>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="vouched">Vouched Only</option>
              <option value="cancelled">Cancelled (Was Vouched)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by booking ID, agency, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* No Supplier Selected State */}
      {!selectedSupplier && (
        <div className="p-12 text-center">
          <div className="mx-auto max-w-4xl">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No Supplier Selected
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Please select a supplier from the dropdown above to view their statement of account.
            </p>
            
            {/* Debug Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Available Data Summary
                </h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <li>📊 Total Bookings: <strong>{bookings.length}</strong></li>
                  <li>💰 Total Payments: <strong>{payments.length}</strong></li>
                  <li>🏢 Total Suppliers: <strong>{suppliers.length}</strong></li>
                  <li>📋 Total Statement Entries: <strong>{statementEntries.length}</strong></li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  Booking Status Distribution
                </h4>
                <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  {Array.from(new Set(bookings.map((b: any) => b.status))).map((status: string) => (
                    <div key={status} className="flex justify-between">
                      <span>{status || 'Unknown'}</span>
                      <span className="font-semibold">
                        {bookings.filter((b: any) => b.status === status).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sample Data Display */}
            {bookings.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sample Booking Data (First 3 bookings)
                </h4>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {bookings.slice(0, 3).map((booking: any, index: number) => (
                    <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded border">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <strong>Booking ID:</strong> {booking.bookingId}
                        </div>
                        <div>
                          <strong>Status:</strong> {booking.status}
                        </div>
                        <div>
                          <strong>Supplier Name:</strong> {
                            (() => {
                              const bookingAny = booking as any;
                              return booking.bookingOverview?.provider?.name || 
                                     booking.bookingOverview?.provider?.supplierName ||
                                     booking.provider?.name ||
                                     booking.provider?.supplierName ||
                                     booking.supplier?.name ||
                                     bookingAny.bookingData?.provider?.name ||
                                     bookingAny.bookingData?.supplier?.name ||
                                     bookingAny.serviceProvider?.name ||
                                     bookingAny.providerInfo?.name ||
                                     'No Name'
                            })()
                          }
                        </div>
                        <div>
                          <strong>Available Fields:</strong> {Object.keys(booking).join(', ')}
                        </div>
                        <div>
                          <strong>Raw Supplier Field:</strong> {JSON.stringify(booking.supplier)}
                        </div>
                        <div>
                          <strong>Provider Source:</strong> {
                            (() => {
                              const bookingAny = booking as any;
                              if (booking.bookingOverview?.provider?.name) return 'booking.bookingOverview.provider.name';
                              if (booking.provider?.name) return 'booking.provider.name';
                              if (booking.supplier?.name) return 'booking.supplier.name';
                              if (bookingAny.bookingData?.provider?.name) return 'bookingData.provider.name';
                              if (bookingAny.serviceProvider?.name) return 'serviceProvider.name';
                              return 'No provider name found';
                            })()
                          }
                        </div>
                        <div>
                          <strong>Currency:</strong> {booking.priceDetails?.originalPrice?.currency || booking.priceDetails?.price?.currency || 'No Currency'}
                        </div>
                        <div>
                          <strong>Amount:</strong> {booking.priceDetails?.originalPrice?.value || booking.priceDetails?.price?.value || 'No Amount'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Supplier Comparison */}
            {suppliers.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-left">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                  Available Suppliers (First 5)
                </h4>
                <div className="space-y-2">
                  {suppliers.slice(0, 5).map((supplier, index) => (
                    <div key={index} className="text-xs text-yellow-600 dark:text-yellow-400">
                      <strong>{supplier.name}</strong> ({supplier.type}) - ID: {supplier._id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards - Accounting Format */}
      {selectedSupplier && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Total Credits</h3>
              <p className="text-xs text-green-500 dark:text-green-400 mb-1">(Net Rates Earned)</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statementSummary.vouchedCount}</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {statementSummary.currency} {statementSummary.totalCredits.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Debits</h3>
              <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">(Payments + Reversals)</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statementSummary.paymentCount + statementSummary.cancelledCount}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {statementSummary.currency} {statementSummary.totalDebits.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Payments Made</h3>
              <p className="text-xs text-red-500 dark:text-red-400 mb-1">(Actual Payments)</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statementSummary.paymentCount}</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {statementSummary.currency} {filteredEntries.filter(e => e.type === 'payment').reduce((sum, e) => sum + (e.debitAmount || 0), 0).toFixed(2)}
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">Account Balance</h3>
              <p className="text-xs text-orange-500 dark:text-orange-400 mb-1">(Credits - Debits)</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {statementSummary.currency} {(statementSummary.totalCredits - statementSummary.totalDebits).toFixed(2)}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Transactions</h3>
              <p className="text-xs text-purple-500 dark:text-purple-400 mb-1">(All Entries)</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{filteredEntries.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statement Table - Accounting Format */}
      {selectedSupplier && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Agency</th>
                <th className="px-6 py-3 text-right text-green-600">Credit ({statementSummary.currency})</th>
                <th className="px-6 py-3 text-right text-blue-600">Debit ({statementSummary.currency})</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.map((entry) => {
                const isCredit = entry.type === 'booking' && entry.creditAmount;
                const isDebit = entry.debitAmount !== undefined;
                
                return (
                  <tr key={`${entry.type}-${entry._id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => handleStatementSelection(entry)}
                        className="flex items-center gap-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1 py-0.5 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Click to view full booking details"
                      >
                        {entry.reference}
                        <Eye className="w-4 h-4 opacity-60" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {entry.description}
                        </div>
                        {entry.type === 'booking' && entry.originalData && 'serviceDates' in entry.originalData && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Service: {new Date(entry.originalData.serviceDates?.startDate || '').toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {entry.supplier?.name || 'N/A'}
                        </div>
                        {entry.originalData && 'supplier' in entry.originalData && entry.originalData.supplier && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {suppliers.find(s => s._id === entry.supplier._id)?.type || 'Unknown'} Supplier
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{entry.agency?.agencyName || 'N/A'}</td>
                    
                    {/* Credit Column */}
                    <td className="px-6 py-4 text-right font-mono font-semibold">
                      {entry.creditAmount ? (
                        <span className="text-green-700 dark:text-green-400">
                          {entry.creditAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    {/* Debit Column */}
                    <td className="px-6 py-4 text-right font-mono font-semibold">
                      {entry.debitAmount ? (
                        <span className={`${
                          entry.type === 'payment' 
                            ? 'text-blue-700 dark:text-blue-400' 
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {entry.debitAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.type === 'payment'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : entry.status?.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {entry.type === 'payment' ? 'Payment' : 
                         entry.status?.toLowerCase() === 'cancelled' ? 'Cancelled' : 'Confirmed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={async () => {
                          setSelectedStatement(entry);
                          setFullBookingData(null); // Clear previous data
                          
                          // If it's a booking, fetch full booking data
                          if (entry.type === 'booking' && entry.originalData && 'bookingId' in entry.originalData) {
                            try {
                              await fetchFullBookingDetails(entry.originalData.bookingId || entry.originalData._id);
                            } catch (error) {
                              console.warn('Failed to fetch full booking data, showing available data');
                            }
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEntries.length === 0 && selectedSupplier && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <div className="space-y-2">
                      <p className="font-medium">No transactions found for this supplier</p>
                      <p className="text-sm text-gray-400">Try adjusting your date range or search filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Statement Detail Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedStatement.type === 'payment' ? 'Payment' : 'Booking'} Statement Details
                </h3>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Related Entries */}
              {(() => {
                const relatedEntries = filteredEntries.filter(entry => 
                  entry.reference === selectedStatement.reference || 
                  (entry.originalData && selectedStatement.originalData && 
                   (('bookingId' in entry.originalData && 'bookingId' in selectedStatement.originalData && 
                     entry.originalData.bookingId === selectedStatement.originalData.bookingId) ||
                    ('_id' in entry.originalData && '_id' in selectedStatement.originalData && 
                     entry.originalData._id === selectedStatement.originalData._id)))
                );
                
                return relatedEntries.length > 1 ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">🔗 Related Entries ({relatedEntries.length})</h5>
                    <div className="space-y-2">
                      {relatedEntries.map(entry => (
                        <div key={entry._id} className={`flex justify-between items-center p-2 rounded text-sm ${
                          entry._id === selectedStatement._id 
                            ? 'bg-indigo-100 dark:bg-indigo-800/50 border-l-4 border-indigo-500' 
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}>
                          <div>
                            <span className="font-medium">{entry.reference}</span>
                            <span className="ml-2 text-xs text-gray-500">({entry.type})</span>
                            {entry._id === selectedStatement._id && 
                              <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded">Current</span>
                            }
                          </div>
                          <div className={`font-medium ${
                            entry.creditAmount ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.creditAmount ? '+' : '-'}{entry.currency} {(entry.creditAmount || entry.debitAmount || 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference ID</label>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selectedStatement.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {selectedStatement.creditAmount ? 'Credit Amount' : 'Debit Amount'}
                  </label>
                  <p className={`text-lg font-semibold ${
                    selectedStatement.creditAmount
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {selectedStatement.currency} {(selectedStatement.creditAmount || selectedStatement.debitAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white">{selectedStatement.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedStatement.type}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedStatement.supplier?.name}
                    {selectedStatement.supplier?._id && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({suppliers.find(s => s._id === selectedStatement.supplier._id)?.type || 'Unknown'})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Agency</label>
                  <p className="text-gray-900 dark:text-white">{selectedStatement.agency?.agencyName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedStatement.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className={`font-semibold ${
                    selectedStatement.type === 'payment'
                      ? 'text-blue-600 dark:text-blue-400'
                      : selectedStatement.status?.toLowerCase() === 'cancelled' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {selectedStatement.type === 'payment' ? 'Payment' :
                     selectedStatement.status?.toLowerCase() === 'cancelled' 
                      ? 'Cancelled' 
                      : 'Confirmed'}
                  </p>
                </div>
              </div>

              {/* Booking Specific Details */}
              {selectedStatement.type === 'booking' && selectedStatement.originalData && 'serviceDates' in selectedStatement.originalData && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>📋 Comprehensive Booking Details</span>
                    </h4>
                    {loadingBookingDetails && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Loading full details...
                      </div>
                    )}
                  </div>

                  {/* Full Booking Data Section */}
                  {fullBookingData && fullBookingData.error ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <span>⚠️</span>
                        <span className="font-medium">Unable to fetch complete booking data</span>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
                        {fullBookingData.message}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        {fullBookingData.fallbackMessage}
                      </p>
                    </div>
                  ) : fullBookingData && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-6">
                      <h5 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                        🌟 Complete Booking Information
                      </h5>
                      
                      {/* Client Information */}
                      {(fullBookingData.clientDetails || fullBookingData.passengers || fullBookingData.customer) && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              Client Information
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fullBookingData.clientDetails && (
                              <>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client Name</label>
                                  <p className="text-gray-900 dark:text-white font-medium">
                                    {fullBookingData.clientDetails.firstName} {fullBookingData.clientDetails.lastName}
                                  </p>
                                </div>
                                {fullBookingData.clientDetails.email && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.clientDetails.email}</p>
                                  </div>
                                )}
                                {fullBookingData.clientDetails.phone && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.clientDetails.phone}</p>
                                  </div>
                                )}
                                {fullBookingData.clientDetails.nationality && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nationality</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.clientDetails.nationality}</p>
                                  </div>
                                )}
                              </>
                            )}
                            
                            {fullBookingData.passengers && Array.isArray(fullBookingData.passengers) && (
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Passengers</label>
                                <div className="space-y-2 mt-2">
                                  {fullBookingData.passengers.map((passenger: any, index: number) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                      <p className="font-medium">
                                        {passenger.title} {passenger.firstName} {passenger.lastName}
                                      </p>
                                      {passenger.age && <p className="text-sm text-gray-500">Age: {passenger.age}</p>}
                                      {passenger.passport && <p className="text-sm text-gray-500">Passport: {passenger.passport}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Provider Information */}
                      {(fullBookingData.providerDetails || fullBookingData.supplier || fullBookingData.hotel) && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            🏨 Provider Information
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fullBookingData.providerDetails && (
                              <>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider Name</label>
                                  <p className="text-gray-900 dark:text-white font-medium">
                                    {fullBookingData.providerDetails.name || fullBookingData.providerDetails.providerName}
                                  </p>
                                </div>
                                {fullBookingData.providerDetails.type && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider Type</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.providerDetails.type}</p>
                                  </div>
                                )}
                                {fullBookingData.providerDetails.location && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.providerDetails.location}</p>
                                  </div>
                                )}
                                {fullBookingData.providerDetails.contact && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.providerDetails.contact}</p>
                                  </div>
                                )}
                              </>
                            )}
                            
                            {fullBookingData.hotel && (
                              <>
                                <div>
                                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Hotel Name</label>
                                  <p className="text-gray-900 dark:text-white font-medium">
                                    {fullBookingData.hotel.name}
                                  </p>
                                </div>
                                {fullBookingData.hotel.address && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.hotel.address}</p>
                                  </div>
                                )}
                                {fullBookingData.hotel.city && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                                    <p className="text-gray-900 dark:text-white">{fullBookingData.hotel.city}</p>
                                  </div>
                                )}
                                {fullBookingData.hotel.rating && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                                    <p className="text-gray-900 dark:text-white">
                                      {'⭐'.repeat(fullBookingData.hotel.rating)} ({fullBookingData.hotel.rating} stars)
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Service Details */}
                      {(fullBookingData.serviceDetails || fullBookingData.rooms || fullBookingData.itinerary) && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            🛏️ Service Details
                          </h6>
                          
                          {fullBookingData.rooms && Array.isArray(fullBookingData.rooms) && (
                            <div className="space-y-3">
                              {fullBookingData.rooms.map((room: any, index: number) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {room.roomType && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Type</label>
                                        <p className="text-gray-900 dark:text-white font-medium">{room.roomType}</p>
                                      </div>
                                    )}
                                    {room.boardBasis && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Board Basis</label>
                                        <p className="text-gray-900 dark:text-white">{room.boardBasis}</p>
                                      </div>
                                    )}
                                    {room.occupancy && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupancy</label>
                                        <p className="text-gray-900 dark:text-white">
                                          {room.occupancy.adults} Adults
                                          {room.occupancy.children > 0 && `, ${room.occupancy.children} Children`}
                                        </p>
                                      </div>
                                    )}
                                    {room.price && (
                                      <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Price</label>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                          {room.price.currency} {room.price.amount?.toLocaleString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {fullBookingData.itinerary && (
                            <div className="mt-4">
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Itinerary</label>
                              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mt-2">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                                  {typeof fullBookingData.itinerary === 'string' 
                                    ? fullBookingData.itinerary 
                                    : JSON.stringify(fullBookingData.itinerary, null, 2)
                                  }
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}


                    </div>
                  )}
                  
                  {/* Reference & Linking Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">🔗 Reference & Relationships</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-600 dark:text-blue-400">Booking ID:</span>
                        <span className="ml-2 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                          {selectedStatement.originalData.bookingId || selectedStatement.reference}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-600 dark:text-blue-400">Internal ID:</span>
                        <span className="ml-2 font-mono text-xs text-gray-500">
                          {selectedStatement.originalData._id}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-600 dark:text-blue-400">Agency:</span>
                        <span className="ml-2">{selectedStatement.originalData.agency?.agencyName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-600 dark:text-blue-400">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          selectedStatement.originalData.status?.toLowerCase() === 'confirmed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : selectedStatement.originalData.status?.toLowerCase() === 'cancelled'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {selectedStatement.originalData.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">📅 Service Details</h5>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-in Date</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {selectedStatement.originalData.serviceDates?.startDate ? 
                           new Date(selectedStatement.originalData.serviceDates.startDate).toLocaleDateString('en-US', {
                             weekday: 'long',
                             month: 'long',
                             day: 'numeric',
                             year: 'numeric'
                           }) : 'Not specified'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Check-out Date</label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {selectedStatement.originalData.serviceDates?.endDate ? 
                           new Date(selectedStatement.originalData.serviceDates.endDate).toLocaleDateString('en-US', {
                             weekday: 'long',
                             month: 'long',
                             day: 'numeric',
                             year: 'numeric'
                           }) : 'Not specified'
                          }
                        </p>
                      </div>
                      {selectedStatement.originalData.serviceDates?.startDate && selectedStatement.originalData.serviceDates?.endDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {Math.ceil((new Date(selectedStatement.originalData.serviceDates.endDate).getTime() - 
                                       new Date(selectedStatement.originalData.serviceDates.startDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">💰 Financial Details</h5>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Original Price</label>
                        <p className="text-gray-900 dark:text-white font-medium text-lg">
                          {selectedStatement.originalData.priceDetails?.originalPrice?.currency || selectedStatement.currency} {' '}
                          {selectedStatement.originalData.priceDetails?.originalPrice?.value?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Final Price</label>
                        <p className="text-gray-900 dark:text-white font-medium text-lg">
                          {selectedStatement.originalData.priceDetails?.price?.currency || selectedStatement.currency} {' '}
                          {selectedStatement.originalData.priceDetails?.price?.value?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      {selectedStatement.originalData.priceDetails?.markupApplied && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Markup Applied</label>
                          <p className="text-orange-600 dark:text-orange-400 font-medium">
                            {selectedStatement.originalData.priceDetails.markupApplied.value}
                            {selectedStatement.originalData.priceDetails.markupApplied.type === 'percentage' ? '%' : ` ${selectedStatement.currency}`}
                            <span className="text-xs ml-2 text-gray-500">({selectedStatement.originalData.priceDetails.markupApplied.type})</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Timeline */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">⏱️ Booking Timeline</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Booking Created:</span>
                        <span className="font-medium">
                          {selectedStatement.originalData.bookingDate ? 
                           new Date(selectedStatement.originalData.bookingDate).toLocaleDateString('en-US', {
                             month: 'short',
                             day: 'numeric',
                             year: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           }) : 'Not specified'
                          }
                        </span>
                      </div>
                      {selectedStatement.originalData.vouchedDate && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Vouched Date:</span>
                          <span className="font-medium text-green-600">
                            {new Date(selectedStatement.originalData.vouchedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      {selectedStatement.originalData.cancelledDate && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Cancelled Date:</span>
                          <span className="font-medium text-red-600">
                            {new Date(selectedStatement.originalData.cancelledDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>


                </div>
              )}

              {/* Payment Specific Details */}
              {selectedStatement.type === 'payment' && selectedStatement.originalData && 'paymentId' in selectedStatement.originalData && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>💳 Comprehensive Payment Details</span>
                  </h4>
                  
                  {/* Payment Reference & Links */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">🔗 Payment Reference & Relationships</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-400">Payment ID:</span>
                        <span className="ml-2 font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                          {selectedStatement.originalData.paymentId}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-400">Internal ID:</span>
                        <span className="ml-2 font-mono text-xs text-gray-500">
                          {selectedStatement.originalData._id}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-400">Related Booking:</span>
                        <span className="ml-2">
                          {selectedStatement.originalData.ledgerEntryId?.referenceId || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600 dark:text-green-400">Payment Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          selectedStatement.originalData.status?.toLowerCase() === 'completed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : selectedStatement.originalData.status?.toLowerCase() === 'failed'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {selectedStatement.originalData.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Amounts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                      <label className="text-sm font-medium text-blue-600 dark:text-blue-400 block mb-2">Total Amount Due</label>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {selectedStatement.originalData.currency || selectedStatement.currency} {' '}
                        {selectedStatement.originalData.fullAmount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                      <label className="text-sm font-medium text-green-600 dark:text-green-400 block mb-2">Amount Paid</label>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {selectedStatement.originalData.currency || selectedStatement.currency} {' '}
                        {selectedStatement.originalData.paidAmount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    
                    <div className={`rounded-lg p-4 text-center ${
                      (selectedStatement.originalData.remainingAmount || 0) > 0 
                        ? 'bg-red-50 dark:bg-red-900/20' 
                        : 'bg-green-50 dark:bg-green-900/20'
                    }`}>
                      <label className={`text-sm font-medium block mb-2 ${
                        (selectedStatement.originalData.remainingAmount || 0) > 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        Remaining Balance
                      </label>
                      <p className={`text-2xl font-bold ${
                        (selectedStatement.originalData.remainingAmount || 0) > 0 
                          ? 'text-red-700 dark:text-red-300' 
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        {selectedStatement.originalData.currency || selectedStatement.currency} {' '}
                        {selectedStatement.originalData.remainingAmount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>

                  {/* Payment Timeline */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">⏱️ Payment Timeline</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Payment Created:</span>
                        <span className="font-medium">
                          {selectedStatement.originalData.createdAt ? 
                           new Date(selectedStatement.originalData.createdAt).toLocaleDateString('en-US', {
                             month: 'short',
                             day: 'numeric',
                             year: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           }) : 'Not specified'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                        <span className="font-medium">
                          {selectedStatement.originalData.updatedAt ? 
                           new Date(selectedStatement.originalData.updatedAt).toLocaleDateString('en-US', {
                             month: 'short',
                             day: 'numeric',
                             year: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           }) : 'Not specified'
                          }
                        </span>
                      </div>
                      {selectedStatement.originalData.createdBy && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Created By:</span>
                          <span className="font-medium">{selectedStatement.originalData.createdBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ledger Entry Details */}
                  {selectedStatement.originalData.ledgerEntryId && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
                      <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-3">📖 Related Ledger Entry</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Entry ID:</span>
                          <span className="font-mono text-xs">{selectedStatement.originalData.ledgerEntryId._id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Reference Type:</span>
                          <span className="font-medium">{selectedStatement.originalData.ledgerEntryId.referenceType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Description:</span>
                          <span className="font-medium">{selectedStatement.originalData.ledgerEntryId.description}</span>
                        </div>
                      </div>
                    </div>
                  )}


                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementsOnAccount;