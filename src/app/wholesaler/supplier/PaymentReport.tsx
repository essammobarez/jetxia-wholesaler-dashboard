'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Eye, CheckCircle, DollarSign, FileText, Building2, CreditCard, Download, X, Check
} from 'lucide-react';

interface Payment {
  _id: string;
  paymentId: string;
  supplier: { _id: string; name: string; type: 'online' | 'offline'; };
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  matchedBookings: string[];
  totalMatchedAmount: number;
  matchingDifference: number;
  createdAt: string;
}

interface BookingForMatching {
  _id: string;
  bookingId: string;
  agency: { agencyName: string; _id: string; };
  supplier: { _id: string; name: string; type: 'online' | 'offline'; };
  serviceDates: { startDate: string; endDate: string; };
  status: string;
  serviceType: string;
  hotelName?: string;
  netRate: number;
  originalCurrency: string;
  isMatched: boolean;
  matchedPaymentId?: string;
  createdAt: string;
  // Enhanced matching fields
  editableAmount?: number; // For partial matching
  isPartialMatch?: boolean;
  remainingAmount?: number; // Amount left after partial matching
}

const PaymentReport = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<BookingForMatching[]>([]);
  const [suppliers, setSuppliers] = useState<{_id: string, name: string, type?: 'online'|'offline'}[]>([]);
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [matchingModal, setMatchingModal] = useState<{payment: Payment | null, isOpen: boolean}>({ payment: null, isOpen: false });
  const [selectedMatchingReport, setSelectedMatchingReport] = useState<Payment | null>(null);
  
  // Enhanced create payment states
  const [paymentForm, setPaymentForm] = useState({
    supplierId: '',
    amount: '',
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    reference: '',
    description: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    immediateMatching: false
  });
  const [paymentValidation, setPaymentValidation] = useState<{[key: string]: string}>({});
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [supplierBookingsPreview, setSupplierBookingsPreview] = useState<BookingForMatching[]>([]);
  const [preSelectedBookings, setPreSelectedBookings] = useState<string[]>([]);

  // Get currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    const currencies: {[key: string]: string} = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'JPY': '¥'
    };
    return currencies[currencyCode] || currencyCode;
  };

  useEffect(() => {
    const storedId = localStorage.getItem('wholesalerId');
      setWholesalerId(storedId);
  }, []);

  useEffect(() => {
    if (!wholesalerId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch suppliers
        const [offlineRes, onlineRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`)
        ]);

        const offlineData = offlineRes.ok ? await offlineRes.json() : [];
        const onlineData = onlineRes.ok ? await onlineRes.json() : {data: []};

        const allSuppliers = [
          ...(Array.isArray(offlineData) ? offlineData : []).map((s: any) => ({...s, type: 'offline'})),
          ...(Array.isArray(onlineData?.data) ? onlineData.data : []).map((s: any) => ({...s, type: 'online'}))
        ];
        setSuppliers(allSuppliers);

        // Create demo payments and bookings for demonstration
        const demoPayments: Payment[] = allSuppliers.slice(0, 3).map((supplier, i) => ({
          _id: `demo_payment_${i + 1}`,
          paymentId: `PAY-${String(1001 + i).padStart(4, '0')}`,
          supplier: { _id: supplier._id, name: supplier.name, type: supplier.type || 'offline' },
          amount: (i + 1) * 1500,
          currency: 'USD',
          paymentDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paymentMethod: ['bank_transfer', 'wire_transfer', 'credit_card'][i] || 'bank_transfer',
          reference: `REF-${2024}${String(i + 1).padStart(3, '0')}`,
          status: ['completed', 'pending', 'completed'][i] as any,
          description: `Payment for ${supplier.name} - ${['January', 'February', 'March'][i]} bookings`,
          matchedBookings: i === 0 ? ['demo_booking_1', 'demo_booking_2'] : [],
          totalMatchedAmount: i === 0 ? 1200 : 0,
          matchingDifference: i === 0 ? 300 : 0,
          createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString()
        }));
        setPayments(demoPayments);

        // Create demo bookings for each supplier
        const demoBookings: BookingForMatching[] = [];
        allSuppliers.forEach((supplier, sIndex) => {
          for (let i = 0; i < 3; i++) {
            demoBookings.push({
              _id: `demo_booking_${supplier._id}_${i + 1}`,
              bookingId: `BK-${supplier._id.slice(-4)}-${String(i + 1).padStart(3, '0')}`,
              agency: {
                agencyName: `Demo Agency ${String.fromCharCode(65 + i)}`,
                _id: `demo_agency_${i + 1}`
              },
              supplier: {
                _id: supplier._id,
                name: supplier.name,
                type: supplier.type || 'offline'
              },
              serviceDates: {
                startDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + (i + 2) * 7 * 24 * 60 * 60 * 1000).toISOString()
              },
              status: ['confirmed', 'ok', 'active'][i] || 'confirmed',
              serviceType: ['Hotel', 'Flight', 'Transfer'][i] || 'Hotel',
              hotelName: `Demo Hotel ${String.fromCharCode(65 + i)}`,
              netRate: (sIndex + 1) * (i + 1) * 300 + 200,
              originalCurrency: ['USD', 'EUR', 'GBP'][i] || 'USD',
              isMatched: (sIndex === 0 && i < 2), // First supplier's first 2 bookings are matched
              matchedPaymentId: (sIndex === 0 && i < 2) ? 'demo_payment_1' : undefined,
              createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
              // Initialize new fields
              editableAmount: (sIndex + 1) * (i + 1) * 300 + 200,
              isPartialMatch: false,
              remainingAmount: 0
            });
          }
        });
        setBookings(demoBookings);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wholesalerId]);

  const filteredPayments = payments;
  const paymentSummary = useMemo(() => ({
    totalCount: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    matchedCount: payments.filter(p => p.matchedBookings.length > 0).length,
    completedAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
  }), [payments]);

  const handleMatchPayment = (payment: Payment) => {
    setMatchingModal({ payment, isOpen: true });
  };

  const handleSaveMatching = async (paymentId: string, selectedBookingIds: string[]) => {
    const payment = payments.find(p => p._id === paymentId);
    if (!payment) return;

    const matchedBookingsList = bookings.filter(b => selectedBookingIds.includes(b._id));
    const totalMatched = matchedBookingsList.reduce((sum, b) => sum + b.netRate, 0);
    const difference = payment.amount - totalMatched;

    setPayments(payments.map(p => 
      p._id === paymentId 
        ? { ...p, matchedBookings: selectedBookingIds, totalMatchedAmount: totalMatched, matchingDifference: difference }
        : p
    ));
    
    setBookings(bookings.map(b => ({
      ...b,
      isMatched: selectedBookingIds.includes(b._id) || Boolean(b.matchedPaymentId && b.matchedPaymentId !== paymentId),
      matchedPaymentId: selectedBookingIds.includes(b._id) ? paymentId : 
                       (b.matchedPaymentId === paymentId ? undefined : b.matchedPaymentId)
    })));
    
    setMatchingModal({ payment: null, isOpen: false });
  };

  // Enhanced payment form handlers
  const handleSupplierChange = (supplierId: string) => {
    setPaymentForm({...paymentForm, supplierId});
    
    // Load supplier's available bookings for preview
    const supplierBookings = bookings.filter(b => 
      b.supplier._id === supplierId && !b.isMatched
    );
    setSupplierBookingsPreview(supplierBookings);
    
    // Auto-calculate suggested payment amount based on unmatched bookings
    const totalUnmatched = supplierBookings.reduce((sum, b) => sum + b.netRate, 0);
    if (totalUnmatched > 0 && !paymentForm.amount) {
      setPaymentForm(prev => ({...prev, amount: totalUnmatched.toFixed(2)}));
    }
    
    // Clear previous selections
    setPreSelectedBookings([]);
  };

  const handleCreatePayment = async () => {
    // Validation
    const errors: {[key: string]: string} = {};
    if (!paymentForm.supplierId) errors.supplier = 'Please select a supplier';
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) errors.amount = 'Please enter a valid amount';
    if (!paymentForm.reference) errors.reference = 'Reference is required';
    if (!paymentForm.description) errors.description = 'Description is required';
    
    setPaymentValidation(errors);
    if (Object.keys(errors).length > 0) return;

    setIsCreatingPayment(true);
    
    try {
      const selectedSupplier = suppliers.find(s => s._id === paymentForm.supplierId);
      if (!selectedSupplier) throw new Error('Supplier not found');

      const newPayment: Payment = {
        _id: Date.now().toString(),
        paymentId: `PAY-${String(payments.length + 1001).padStart(4, '0')}`,
        supplier: { 
          _id: selectedSupplier._id, 
          name: selectedSupplier.name, 
          type: selectedSupplier.type || 'offline' 
        },
        amount: parseFloat(paymentForm.amount),
        currency: paymentForm.currency,
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference,
        status: 'pending',
        description: paymentForm.description,
        matchedBookings: paymentForm.immediateMatching ? preSelectedBookings : [],
        totalMatchedAmount: paymentForm.immediateMatching ? 
          supplierBookingsPreview.filter(b => preSelectedBookings.includes(b._id))
            .reduce((sum, b) => sum + b.netRate, 0) : 0,
        matchingDifference: 0,
        createdAt: new Date().toISOString()
      };
      
      // Calculate matching difference
      newPayment.matchingDifference = newPayment.amount - newPayment.totalMatchedAmount;
      
      setPayments([...payments, newPayment]);
      
      // Update matched bookings if immediate matching is enabled
      if (paymentForm.immediateMatching && preSelectedBookings.length > 0) {
        setBookings(bookings.map(b => ({
          ...b,
          isMatched: preSelectedBookings.includes(b._id) || b.isMatched,
          matchedPaymentId: preSelectedBookings.includes(b._id) ? newPayment._id : b.matchedPaymentId
        })));
      }
      
      setShowCreatePaymentModal(false);
      resetPaymentForm();
      
    } catch (error) {
      setPaymentValidation({ general: 'Failed to create payment. Please try again.' });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      supplierId: '',
      amount: '',
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      reference: '',
      description: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
      immediateMatching: false
    });
    setPaymentValidation({});
    setSupplierBookingsPreview([]);
    setPreSelectedBookings([]);
  };

  if (loading) {
    return <div className="card-modern p-6 text-center">Loading payment report...</div>;
  }

  if (error) {
    return <div className="card-modern p-6 text-center bg-red-50">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Live Data Status */}
      <div className="card-modern p-4 bg-orange-50 dark:bg-orange-900/20">
        <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          Payment Management - Live Data
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div><span className="font-medium">Suppliers:</span> {suppliers.length}</div>
          <div><span className="font-medium">Payments:</span> {paymentSummary.totalCount}</div>
          <div><span className="font-medium">Bookings:</span> {bookings.length}</div>
          <div><span className="font-medium">Matched:</span> {paymentSummary.matchedCount}</div>
          <div><span className="font-medium">Total:</span> USD {paymentSummary.totalAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="card-modern overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-orange-600" />
                Supplier Payment Management
        </h2>
              <p className="text-gray-600">Manage payments and match with confirmed bookings</p>
            </div>
            <button 
              onClick={() => setShowCreatePaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Payment
            </button>
          </div>
      </div>

        {/* Summary Cards */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: 'Total Payments', value: paymentSummary.totalCount, amount: paymentSummary.totalAmount, color: 'blue' },
              { label: 'Completed', value: payments.filter(p => p.status === 'completed').length, amount: paymentSummary.completedAmount, color: 'green' },
              { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, amount: paymentSummary.pendingAmount, color: 'yellow' },
              { label: 'Matched', value: paymentSummary.matchedCount, amount: 0, color: 'purple' },
              { label: 'Unmatched', value: paymentSummary.totalCount - paymentSummary.matchedCount, amount: 0, color: 'orange' }
            ].map((item, index) => (
              <div key={index} className={`bg-${item.color}-50 p-4 rounded-lg`}>
                <h3 className={`text-sm font-medium text-${item.color}-600`}>{item.label}</h3>
                <p className={`text-2xl font-bold text-${item.color}-700`}>{item.value}</p>
                {item.amount > 0 && <p className={`text-sm text-${item.color}-600`}>USD {item.amount.toFixed(2)}</p>}
          </div>
            ))}
          </div>
      </div>

        {/* Payment Table */}
      <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-3">Payment ID</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Matched</th>
                <th className="px-6 py-3">Difference</th>
                <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">{payment.paymentId}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{payment.supplier.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${payment.supplier.type === 'online' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        {payment.supplier.type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold">
                    {getCurrencySymbol(payment.currency)} {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.matchedBookings.length > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {payment.matchedBookings.length > 0 ? (
                        <><CheckCircle className="w-3 h-3" />{payment.matchedBookings.length}</>
                      ) : 'Not Matched'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">
                    {payment.matchedBookings.length > 0 ? (
                      <span className={`font-semibold ${
                        Math.abs(payment.matchingDifference) < 0.01 ? 'text-green-600' :
                        payment.matchingDifference > 0 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {payment.matchingDifference > 0 && '+'}{getCurrencySymbol(payment.currency)} {payment.matchingDifference.toFixed(2)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        onClick={() => handleMatchPayment(payment)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg"
                      >
                        <Building2 className="w-3 h-3" />
                        Match
                      </button>
                      {payment.matchedBookings.length > 0 && (
                        <button
                          onClick={() => setSelectedMatchingReport(payment)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg"
                        >
                          <Eye className="w-3 h-3" />
                          Report
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Matching Modal */}
      {matchingModal.isOpen && matchingModal.payment && (
        <PaymentMatchingModal
          payment={matchingModal.payment}
          bookings={bookings.filter(b => b.supplier._id === matchingModal.payment!.supplier._id)}
          onClose={() => setMatchingModal({ payment: null, isOpen: false })}
          onSave={handleSaveMatching}
          getCurrencySymbol={getCurrencySymbol}
        />
      )}

      {/* Matching Report Modal */}
      {selectedMatchingReport && (
        <MatchingReportModal
          payment={selectedMatchingReport}
          bookings={bookings.filter(b => selectedMatchingReport.matchedBookings.includes(b._id))}
          onClose={() => setSelectedMatchingReport(null)}
          getCurrencySymbol={getCurrencySymbol}
        />
      )}

      {/* Enhanced Create Payment Modal */}
      {showCreatePaymentModal && (
        <EnhancedCreatePaymentModal
          suppliers={suppliers}
          paymentForm={paymentForm}
          setPaymentForm={setPaymentForm}
          supplierBookingsPreview={supplierBookingsPreview}
          preSelectedBookings={preSelectedBookings}
          setPreSelectedBookings={setPreSelectedBookings}
          onSupplierChange={handleSupplierChange}
          onClose={() => {
            setShowCreatePaymentModal(false);
            resetPaymentForm();
          }}
          onSave={handleCreatePayment}
          isCreating={isCreatingPayment}
          validation={paymentValidation}
          getCurrencySymbol={getCurrencySymbol}
        />
      )}
    </div>
  );
};

// Enhanced Payment Matching Modal
const PaymentMatchingModal: React.FC<{
  payment: Payment;
  bookings: BookingForMatching[];
  onClose: () => void;
  onSave: (paymentId: string, selectedBookingIds: string[]) => void;
  getCurrencySymbol: (code: string) => string;
}> = ({ payment, bookings, onClose, onSave, getCurrencySymbol }) => {
  const [selectedBookings, setSelectedBookings] = useState<string[]>(payment.matchedBookings);
  const [editableAmounts, setEditableAmounts] = useState<{[bookingId: string]: number}>({});
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Initialize editable amounts with full booking amounts
  React.useEffect(() => {
    const initialAmounts: {[bookingId: string]: number} = {};
    bookings.forEach(booking => {
      initialAmounts[booking._id] = booking.netRate;
    });
    setEditableAmounts(initialAmounts);
  }, [bookings]);

  const handleBookingToggle = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]
    );
  };

  const handleAmountEdit = (bookingId: string, newAmount: number) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (!booking) return;
    
    // Ensure amount doesn't exceed original booking amount
    const maxAmount = booking.netRate;
    const validAmount = Math.min(Math.max(newAmount, 0), maxAmount);
    
    setEditableAmounts(prev => ({
      ...prev,
      [bookingId]: validAmount
    }));
  };

  const getEffectiveAmount = (bookingId: string): number => {
    return isEditingMode ? (editableAmounts[bookingId] || 0) : (bookings.find(b => b._id === bookingId)?.netRate || 0);
  };

  const selectedTotal = selectedBookings.reduce((sum, bookingId) => sum + getEffectiveAmount(bookingId), 0);
  const isOverPayment = selectedTotal > payment.amount;
  const matchingAccuracy = payment.amount > 0 ? (selectedTotal / payment.amount) * 100 : 0;

               return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-orange-600" />
              Match Payment with Bookings
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Details</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p><span className="font-medium">ID:</span> {payment.paymentId}</p>
                <p><span className="font-medium">Amount:</span> <span className="font-bold">{payment.currency} {payment.amount.toFixed(2)}</span></p>
                <p><span className="font-medium">Supplier:</span> {payment.supplier.name}</p>
                <p><span className="font-medium">Date:</span> {new Date(payment.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isOverPayment ? 'bg-red-50' : 'bg-green-50'}`}>
              <h4 className={`font-semibold mb-2 ${isOverPayment ? 'text-red-900' : 'text-green-900'}`}>Selected Bookings</h4>
              <div className={`space-y-1 text-sm ${isOverPayment ? 'text-red-700' : 'text-green-700'}`}>
                <p><span className="font-medium">Count:</span> <span className="font-bold">{selectedBookings.length}</span></p>
                <p><span className="font-medium">Total:</span> <span className="font-bold">USD {selectedTotal.toFixed(2)}</span></p>
                <p><span className="font-medium">Difference:</span> 
                  <span className={`font-bold ml-1 ${
                    Math.abs(payment.amount - selectedTotal) < 0.01 ? 'text-green-600' :
                    isOverPayment ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {payment.amount - selectedTotal > 0 ? '+' : ''}USD {(payment.amount - selectedTotal).toFixed(2)}
                  </span>
                </p>
                {isOverPayment && (
                  <p className="text-xs text-red-600 font-medium">⚠️ Over-payment not allowed</p>
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Available Bookings</h4>
              <div className="space-y-1 text-sm text-purple-700">
                <p><span className="font-medium">Total:</span> {bookings.length}</p>
                <p><span className="font-medium">Unmatched:</span> {bookings.filter(b => !b.isMatched).length}</p>
                <p><span className="font-medium">Supplier Type:</span> {payment.supplier.type}</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              Math.abs(payment.amount - selectedTotal) < 0.01 ? 'bg-green-50' :
              isOverPayment ? 'bg-red-50' : 'bg-orange-50'
            }`}>
              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                Math.abs(payment.amount - selectedTotal) < 0.01 ? 'text-green-900' :
                isOverPayment ? 'text-red-900' : 'text-orange-900'
              }`}>
                <DollarSign className="w-4 h-4" />
                Matching Control
              </h4>
              <div className="space-y-2">
                <p className={`font-bold text-sm ${
                  Math.abs(payment.amount - selectedTotal) < 0.01 ? 'text-green-700' :
                  isOverPayment ? 'text-red-700' : 'text-orange-700'
                }`}>
                  {Math.abs(payment.amount - selectedTotal) < 0.01 ? '✓ Perfect Match' :
                   isOverPayment ? '❌ Over Payment' : '⚠ Under Payment'}
                </p>
                <p className="text-xs">Accuracy: {matchingAccuracy.toFixed(1)}%</p>
                {selectedTotal > 0 && isEditingMode && (
                  <p className="text-xs text-purple-600">
                    {selectedBookings.filter(id => getEffectiveAmount(id) < (bookings.find(b => b._id === id)?.netRate || 0)).length} partial matches
                  </p>
                )}
                <button
                  onClick={() => setIsEditingMode(!isEditingMode)}
                  className={`w-full px-3 py-1 text-xs rounded-lg transition-colors ${
                    isEditingMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isEditingMode ? '✓ Editing Mode ON' : '✏️ Enable Partial Matching'}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Booking Selection Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Available Transactions for Matching
                {isEditingMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    ✏️ Partial Matching Enabled
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-2">
                {isOverPayment && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                    ❌ Over-payment not allowed
                  </div>
                )}
                {isEditingMode && selectedTotal < payment.amount && selectedBookings.length > 0 && (
                  <button
                    onClick={() => {
                      // Auto-adjust last selected booking to match exactly
                      if (selectedBookings.length > 0) {
                        const remainingAmount = payment.amount - selectedTotal + getEffectiveAmount(selectedBookings[selectedBookings.length - 1]);
                        const lastBookingId = selectedBookings[selectedBookings.length - 1];
                        const lastBooking = bookings.find(b => b._id === lastBookingId);
                        
                        if (lastBooking && remainingAmount <= lastBooking.netRate && remainingAmount > 0) {
                          handleAmountEdit(lastBookingId, remainingAmount);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                    title={`Adjust last booking to match exactly USD ${payment.amount.toFixed(2)}`}
                  >
                    🎯 Auto Match Exact
                  </button>
                )}
                {Math.abs(payment.amount - selectedTotal) < 0.01 && selectedBookings.length > 0 && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    ✅ Perfect matching achieved!
                  </div>
                )}
                {selectedBookings.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedBookings([]);
                      // Reset amounts to original values
                      const resetAmounts: {[bookingId: string]: number} = {};
                      bookings.forEach(booking => {
                        resetAmounts[booking._id] = booking.netRate;
                      });
                      setEditableAmounts(resetAmounts);
                    }}
                    className="text-red-600 hover:text-red-800 underline text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 w-12">Select</th>
                    <th className="px-4 py-3">Booking Details</th>
                    <th className="px-4 py-3">Agency</th>
                    <th className="px-4 py-3">Service Date</th>
                    <th className="px-4 py-3 text-right">Original Amount</th>
                    {isEditingMode && <th className="px-4 py-3 text-right">Match Amount</th>}
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr 
                      key={booking._id} 
                      className={`cursor-pointer transition-all ${
                        selectedBookings.includes(booking._id) ? 'bg-orange-50 border-l-4 border-orange-500' :
                        booking.isMatched ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => !booking.isMatched && handleBookingToggle(booking._id)}
                    >
                      <td className="px-4 py-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedBookings.includes(booking._id) ? 'border-orange-500 bg-orange-500' :
                          booking.isMatched ? 'border-gray-300 bg-gray-300' : 'border-gray-300'
                        }`}>
                          {selectedBookings.includes(booking._id) && <Check className="w-3 h-3 text-white" />}
                          {booking.isMatched && !selectedBookings.includes(booking._id) && <X className="w-3 h-3 text-gray-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-blue-600">{booking.bookingId}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              booking.supplier.type === 'online' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {booking.supplier.type}
                            </span>
                            {isEditingMode && selectedBookings.includes(booking._id) && getEffectiveAmount(booking._id) < booking.netRate && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                ✂️ Partial
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">🏨 {booking.hotelName || booking.serviceType}</div>
                          {isEditingMode && selectedBookings.includes(booking._id) && getEffectiveAmount(booking._id) < booking.netRate && (
                            <div className="text-xs text-purple-600 mt-1">
                              Remaining: USD {(booking.netRate - getEffectiveAmount(booking._id)).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{booking.agency.agencyName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(booking.serviceDates.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono font-semibold">
                          {getCurrencySymbol(booking.originalCurrency)} {booking.netRate.toFixed(2)}
                          {isEditingMode && getEffectiveAmount(booking._id) !== booking.netRate && (
                            <div className="text-xs text-gray-500 line-through">
                              Original: {booking.netRate.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      {isEditingMode && (
                        <td className="px-4 py-3 text-right">
                          <div className="space-y-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max={booking.netRate}
                              value={editableAmounts[booking._id]?.toFixed(2) || booking.netRate.toFixed(2)}
                              onChange={(e) => handleAmountEdit(booking._id, parseFloat(e.target.value) || 0)}
                              className={`w-24 px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-orange-500 text-right font-mono ${
                                selectedBookings.includes(booking._id) 
                                  ? 'border-orange-500 bg-orange-50' 
                                  : 'border-gray-300'
                              }`}
                              disabled={booking.isMatched}
                            />
                            <div className="text-xs text-gray-500">
                              Max: {booking.netRate.toFixed(2)}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                      <td className="px-4 py-3 text-center">
                        {booking.isMatched ? (
                          <div className="text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Already Matched
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            <Building2 className="w-3 h-3" />
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={isEditingMode ? 8 : 7} className="text-center py-12">
                        <div className="text-gray-500">
                          <Building2 className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                          <h5 className="font-medium mb-2">No bookings available for matching</h5>
                          <div className="text-sm space-y-2">
                            <p>No confirmed bookings found for this supplier</p>
                            <p className="text-xs">Bookings must have status: confirmed, ok, active, or pending</p>
                            <div className="mt-4">
                              <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                              >
                                <Search className="w-4 h-4" />
                                Refresh Bookings
                              </button>
                            </div>
                          </div>
                        </div>
                  </td>
                </tr>
              )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-1">
                <p><span className="font-medium">Selected:</span> {selectedBookings.length} of {bookings.filter(b => !b.isMatched).length} available bookings</p>
                <p><span className="font-medium">Payment Amount:</span> USD {payment.amount.toFixed(2)}</p>
                <p><span className="font-medium">Selected Total:</span> USD {selectedTotal.toFixed(2)}</p>
                {selectedTotal > 0 && (
                  <p>
                    <span className="font-medium">Matching Accuracy:</span> 
                    <span className={`font-semibold ml-1 ${
                      Math.abs(payment.amount - selectedTotal) < 0.01 ? 'text-green-600' :
                      isOverPayment ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {matchingAccuracy.toFixed(1)}%
                    </span>
                  </p>
                )}
                {isEditingMode && (
                  <p className="text-blue-600 font-medium">
                    ✏️ Partial matching enabled - you can edit individual booking amounts
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save with edited amounts
                  const matchingData = selectedBookings.map(bookingId => ({
                    bookingId,
                    amount: getEffectiveAmount(bookingId),
                    isPartial: isEditingMode && getEffectiveAmount(bookingId) < (bookings.find(b => b._id === bookingId)?.netRate || 0)
                  }));
                  
                  // For now, just save the booking IDs (can be enhanced to save amounts)
                  onSave(payment._id, selectedBookings);
                }}
                disabled={selectedBookings.length === 0 || isOverPayment}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isOverPayment 
                    ? 'bg-red-600 text-white opacity-50 cursor-not-allowed' 
                    : selectedBookings.length === 0
                    ? 'bg-gray-400 text-white opacity-50 cursor-not-allowed'
                    : Math.abs(payment.amount - selectedTotal) < 0.01
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
                title={
                  isOverPayment ? 'Cannot save: Selected amount exceeds payment amount' :
                  selectedBookings.length === 0 ? 'Select at least one booking to match' :
                  'Save the current matching selection'
                }
              >
                <CheckCircle className="w-4 h-4" />
                {isOverPayment ? 'Over-Payment Blocked' : 
                 Math.abs(payment.amount - selectedTotal) < 0.01 ? 'Perfect Match - Save' :
                 `Save Matching (${selectedBookings.length})`}
              </button>
            </div>
          </div>
          
          {/* Enhanced Matching Guidelines */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">Matching Guidelines:</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-700 dark:text-blue-300">
              <div>
                <p className="font-medium">✅ Perfect Match (100%)</p>
                <p>Selected total equals payment amount exactly</p>
              </div>
              <div>
                <p className="font-medium">⚠️ Under Payment (&lt;100%)</p>
                <p>Selected total is less than payment amount</p>
              </div>
              <div>
                <p className="font-medium">❌ Over Payment (&gt;100%)</p>
                <p>Selected total exceeds payment - NOT ALLOWED</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>Tip:</strong> Use "Enable Partial Matching" to edit individual booking amounts for precise matching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Matching Report Modal  
const MatchingReportModal: React.FC<{
  payment: Payment;
  bookings: BookingForMatching[];
  onClose: () => void;
  getCurrencySymbol: (code: string) => string;
}> = ({ payment, bookings, onClose, getCurrencySymbol }) => {
  const totalMatched = bookings.reduce((sum, booking) => sum + booking.netRate, 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Payment Matching Report
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">ID:</span> {payment.paymentId}</p>
                <p><span className="font-medium">Supplier:</span> {payment.supplier.name}</p>
                <p><span className="font-medium">Amount:</span> {payment.currency} {payment.amount.toFixed(2)}</p>
                <p><span className="font-medium">Method:</span> {payment.paymentMethod.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Matching Summary</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Matched Bookings:</span> {bookings.length}</p>
                <p><span className="font-medium">Total Matched:</span> USD {totalMatched.toFixed(2)}</p>
                <p><span className="font-medium">Difference:</span> 
                  <span className={`font-bold ml-1 ${
                    Math.abs(payment.amount - totalMatched) < 0.01 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    USD {Math.abs(payment.amount - totalMatched).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Matched Bookings Table */}
          <div>
            <h4 className="font-semibold mb-3">Matched Bookings:</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Booking ID</th>
                    <th className="px-4 py-2">Agency</th>
                    <th className="px-4 py-2">Service</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-blue-600">{booking.bookingId}</td>
                      <td className="px-4 py-2">{booking.agency.agencyName}</td>
                      <td className="px-4 py-2">{booking.hotelName || booking.serviceType}</td>
                      <td className="px-4 py-2">{new Date(booking.serviceDates.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-right font-mono">{getCurrencySymbol(booking.originalCurrency)} {booking.netRate.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.supplier.type === 'online' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.supplier.type}
                        </span>
                    </td>
                </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Create Payment Modal Component
const EnhancedCreatePaymentModal: React.FC<{
  suppliers: {_id: string, name: string, type?: 'online'|'offline'}[];
  paymentForm: any;
  setPaymentForm: (form: any) => void;
  supplierBookingsPreview: BookingForMatching[];
  preSelectedBookings: string[];
  setPreSelectedBookings: (bookings: string[]) => void;
  onSupplierChange: (supplierId: string) => void;
  onClose: () => void;
  onSave: () => void;
  isCreating: boolean;
  validation: {[key: string]: string};
  getCurrencySymbol: (code: string) => string;
}> = ({ 
  suppliers, paymentForm, setPaymentForm, supplierBookingsPreview, preSelectedBookings, 
  setPreSelectedBookings, onSupplierChange, onClose, onSave, isCreating, validation, getCurrencySymbol 
}) => {
  const availableCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  const selectedSupplier = suppliers.find(s => s._id === paymentForm.supplierId);
  const preSelectedTotal = supplierBookingsPreview
    .filter(b => preSelectedBookings.includes(b._id))
    .reduce((sum, b) => sum + b.netRate, 0);
  
  const isOverPayment = preSelectedTotal > parseFloat(paymentForm.amount || '0');

  const handleBookingToggle = (bookingId: string) => {
    const booking = supplierBookingsPreview.find(b => b._id === bookingId);
    if (!booking) return;

    if (preSelectedBookings.includes(bookingId)) {
      setPreSelectedBookings(preSelectedBookings.filter(id => id !== bookingId));
    } else {
      // Check if adding this booking would cause over-payment
      const newTotal = preSelectedTotal + booking.netRate;
      if (newTotal <= parseFloat(paymentForm.amount || '0')) {
        setPreSelectedBookings([...preSelectedBookings, bookingId]);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                Create New Payment
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create payment and optionally match with supplier bookings
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isCreating}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left Side - Payment Form */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Payment Information
              </h4>

              {validation.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-red-700 dark:text-red-400 text-sm">{validation.general}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Supplier Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supplier *
                  </label>
                  <select
                    value={paymentForm.supplierId}
                    onChange={(e) => onSupplierChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all ${
                      validation.supplier 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isCreating}
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name} ({supplier.type || 'offline'})
                      </option>
                    ))}
                  </select>
                  {validation.supplier && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validation.supplier}</p>
                  )}
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all ${
                          validation.amount 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="0.00"
                        disabled={isCreating}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-medium">
                          {getCurrencySymbol(paymentForm.currency)}
                        </span>
                      </div>
                    </div>
                    {validation.amount && (
                      <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validation.amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency *
                    </label>
                    <select
                      value={paymentForm.currency}
                      onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      disabled={isCreating}
                    >
                      {availableCurrencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Method and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      disabled={isCreating}
                    >
                      <option value="bank_transfer">🏦 Bank Transfer</option>
                      <option value="wire_transfer">💸 Wire Transfer</option>
                      <option value="credit_card">💳 Credit Card</option>
                      <option value="check">📋 Check</option>
                      <option value="cash">💵 Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                      disabled={isCreating}
                    />
                  </div>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Reference *
                  </label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all ${
                      validation.reference 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., TXN-202409-001, WIRE-123456, CHECK-789"
                    disabled={isCreating}
                  />
                  {validation.reference && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validation.reference}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Description *
                  </label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition-all ${
                      validation.description 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    rows={3}
                    placeholder="e.g., Payment for September hotel bookings, Q3 settlement, Weekly supplier payment..."
                    disabled={isCreating}
                  />
                  {validation.description && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validation.description}</p>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Internal Notes (Optional)
                  </label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    rows={2}
                    placeholder="Optional internal notes, approval information, etc."
                    disabled={isCreating}
                  />
                </div>

                {/* Immediate Matching Toggle */}
                {selectedSupplier && supplierBookingsPreview.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentForm.immediateMatching}
                        onChange={(e) => setPaymentForm({...paymentForm, immediateMatching: e.target.checked})}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        disabled={isCreating}
                      />
                      <div>
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          Enable immediate matching
                        </span>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Match this payment with selected bookings immediately upon creation
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Supplier Bookings Preview */}
          <div className="space-y-6">
            {selectedSupplier ? (
              <>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    {selectedSupplier.name} - Available Bookings
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                      selectedSupplier.type === 'online' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        selectedSupplier.type === 'online' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      {selectedSupplier.type}
                    </span>
                  </h4>

                  {supplierBookingsPreview.length > 0 ? (
                    <div className="space-y-4">
                      {/* Matching Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{supplierBookingsPreview.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{preSelectedBookings.length}</div>
                          <div className="text-sm text-orange-600 dark:text-orange-400">Selected</div>
                        </div>
                        <div className={`p-3 rounded-lg text-center ${
                          isOverPayment ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                        }`}>
                          <div className={`text-2xl font-bold ${
                            isOverPayment ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
                          }`}>
                            {getCurrencySymbol(paymentForm.currency)} {preSelectedTotal.toFixed(2)}
                          </div>
                          <div className={`text-sm ${
                            isOverPayment ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`}>
                            {isOverPayment ? 'Over Payment!' : 'Total Selected'}
                          </div>
                        </div>
                      </div>

                      {/* Bookings List */}
                      <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 w-10">Select</th>
                              <th className="px-3 py-2 text-left">Booking</th>
                              <th className="px-3 py-2 text-left">Agency</th>
                              <th className="px-3 py-2 text-right">Amount</th>
                              <th className="px-3 py-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {supplierBookingsPreview.map((booking) => {
                              const wouldCauseOverPayment = !preSelectedBookings.includes(booking._id) && 
                                (preSelectedTotal + booking.netRate) > parseFloat(paymentForm.amount || '0');
                              
                              return (
                                <tr 
                                  key={booking._id}
                                  className={`cursor-pointer transition-all ${
                                    preSelectedBookings.includes(booking._id) 
                                      ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                                      : wouldCauseOverPayment
                                      ? 'bg-red-50 dark:bg-red-900/20 opacity-50 cursor-not-allowed'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                  }`}
                                  onClick={() => !wouldCauseOverPayment && handleBookingToggle(booking._id)}
                                  title={wouldCauseOverPayment ? 'Would cause over-payment' : 'Click to select/deselect'}
                                >
                                  <td className="px-3 py-2">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                      preSelectedBookings.includes(booking._id)
                                        ? 'border-orange-500 bg-orange-500'
                                        : wouldCauseOverPayment
                                        ? 'border-red-300 bg-red-100'
                                        : 'border-gray-300'
                                    }`}>
                                      {preSelectedBookings.includes(booking._id) && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                      {wouldCauseOverPayment && (
                                        <X className="w-2 h-2 text-red-500" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div>
                                      <div className="font-medium text-blue-600">{booking.bookingId}</div>
                                      <div className="text-xs text-gray-500">{booking.serviceType}</div>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="text-sm">{booking.agency.agencyName}</div>
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono font-semibold">
                                    {getCurrencySymbol(booking.originalCurrency)} {booking.netRate.toFixed(2)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
          </tbody>
        </table>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Select all bookings that don't cause over-payment
                            const newSelections: string[] = [];
                            let runningTotal = 0;
                            const paymentAmount = parseFloat(paymentForm.amount || '0');
                            
                            supplierBookingsPreview.forEach(booking => {
                              if (runningTotal + booking.netRate <= paymentAmount) {
                                newSelections.push(booking._id);
                                runningTotal += booking.netRate;
                              }
                            });
                            
                            setPreSelectedBookings(newSelections);
                          }}
                          className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                          disabled={isCreating}
                        >
                          📋 Select All (Within Limit)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreSelectedBookings([])}
                          className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          disabled={isCreating}
                        >
                          🗑️ Clear Selection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h5 className="font-medium mb-2">No Available Bookings</h5>
                      <p className="text-sm">This supplier has no unmatched confirmed bookings.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h5 className="font-medium mb-2">Select a Supplier</h5>
                <p className="text-sm">Choose a supplier to see available bookings for matching</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-1">
                <p><span className="font-medium">Payment Amount:</span> {getCurrencySymbol(paymentForm.currency)} {paymentForm.amount || '0.00'}</p>
                {preSelectedBookings.length > 0 && (
                  <>
                    <p><span className="font-medium">Pre-selected Bookings:</span> {preSelectedBookings.length}</p>
                    <p><span className="font-medium">Pre-selected Total:</span> USD {preSelectedTotal.toFixed(2)}</p>
                    <p>
                      <span className="font-medium">Matching Status:</span> 
                      <span className={`ml-1 font-semibold ${
                        Math.abs(parseFloat(paymentForm.amount || '0') - preSelectedTotal) < 0.01 ? 'text-green-600' :
                        isOverPayment ? 'text-red-600' : 'text-orange-600'
                      }`}>
                        {Math.abs(parseFloat(paymentForm.amount || '0') - preSelectedTotal) < 0.01 ? 'Perfect Match' :
                         isOverPayment ? 'Over Payment - Not Allowed' : 'Under Payment'}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isCreating}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={
                  !paymentForm.supplierId || 
                  !paymentForm.amount || 
                  !paymentForm.reference || 
                  !paymentForm.description || 
                  isCreating ||
                  (paymentForm.immediateMatching && isOverPayment)
                }
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium ${
                  isCreating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : (paymentForm.immediateMatching && isOverPayment)
                    ? 'bg-red-600 text-white opacity-50 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
                title={
                  paymentForm.immediateMatching && isOverPayment 
                    ? 'Cannot create: Pre-selected bookings exceed payment amount'
                    : 'Create payment and optionally match with selected bookings'
                }
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    {paymentForm.immediateMatching && preSelectedBookings.length > 0 
                      ? `Create & Match (${preSelectedBookings.length})`
                      : 'Create Payment'
                    }
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReport;
