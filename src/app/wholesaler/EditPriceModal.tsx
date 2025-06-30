import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Reservation } from './BookingModal'; // Ensure Reservation interface is imported
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiDollarSign,
  FiGlobe,
  FiArrowUp,
  FiTag,
  FiSave,
  FiX,
  FiCheck,
  FiChevronDown,
} from 'react-icons/fi';

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: {
    supplierId: string;
    supplierName: string;
    basePrice: string; // This state will hold the "New Price" value
    currency: string;
    markup: string;
    commission: string;
    discount: string;
  }) => void;
  reservation: Reservation | null;
  calculatedPrices: { s: number; m: number; np: number; c: number; d: number; sp: number } | null;
}

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

const modalVariants = {
  hidden: { y: '-50%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};

interface Supplier {
  _id: string;
  name: string;
  type: 'Offline' | 'Online'; // Add a type property to distinguish suppliers
}

const EditPriceModal: React.FC<EditPriceModalProps> = ({ isOpen, onClose, onSave, reservation, calculatedPrices }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [basePrice, setBasePrice] = useState(''); // "New Price" state
  const [currency, setCurrency] = useState('');
  const [markup, setMarkup] = useState(''); // Markup will be calculated
  const [commission, setCommission] = useState('');
  const [discount, setDiscount] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // All suppliers from both APIs
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Store the original values from the reservation for calculation
  const originalBasePriceRef = useRef<number>(0);
  const originalMarkupRef = useRef<number>(0);

  // Function to calculate markup based on "New Price" and original values
  const calculateMarkup = useCallback(() => {
    const newPriceValue = parseFloat(basePrice); // User-typed "New Price"
    const originalBasePrice = originalBasePriceRef.current;
    const originalMarkup = originalMarkupRef.current;

    if (!isNaN(newPriceValue) && !isNaN(originalBasePrice) && !isNaN(originalMarkup)) {
      const difference = originalBasePrice - newPriceValue;
      const newCalculatedMarkup = originalMarkup + difference;
      setMarkup(newCalculatedMarkup.toFixed(2));
    } else {
      // If "New Price" is empty or invalid, revert to original markup or a default
      setMarkup(originalMarkup !== 0 ? originalMarkup.toFixed(2) : '0.00');
    }
  }, [basePrice]); // Depend on basePrice (New Price)

  // Effect to re-calculate markup whenever basePrice (New Price) changes
  useEffect(() => {
    calculateMarkup();
  }, [calculateMarkup]);

  // Initialize states when modal opens or reservation data changes
  useEffect(() => {
    if (isOpen && reservation && calculatedPrices) {
      // Don't set supplierId or supplierName here initially to allow "Select a supplier" to show
      setBasePrice(''); // Always initialize "New Price" as empty for user input

      // Store original values when modal opens
      originalBasePriceRef.current = reservation.priceIssueNet;
      originalMarkupRef.current = calculatedPrices.m;

      setCurrency(reservation.currency);
      setMarkup(calculatedPrices.m.toFixed(2)); // Initialize markup with response value
      setCommission(calculatedPrices.c.toFixed(2));
      setDiscount(calculatedPrices.d.toFixed(2));
    } else if (!isOpen) {
      // Reset all states when modal closes to ensure a clean slate
      setSupplierId('');
      setSupplierName('');
      setBasePrice('');
      setCurrency('');
      setMarkup('');
      setCommission('');
      setDiscount('');
      setSelectedSupplier(null); // Ensure selectedSupplier is null to show "Select a supplier"
      originalBasePriceRef.current = 0; // Reset refs too
      originalMarkupRef.current = 0;
    }
  }, [isOpen, reservation, calculatedPrices]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Fetch suppliers from both APIs
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const wholesalerId = '6857c852462871f5be84204c';

        // Fetch from first API (Offline)
        const response1 = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`);
        if (!response1.ok) throw new Error(`HTTP error! status: ${response1.status}`);
        const data1 = await response1.json();
        const offlineSuppliers: Supplier[] = (Array.isArray(data1) ? data1 : data1.data || []).map((supplier: any) => ({
          _id: supplier._id,
          name: supplier.name,
          type: 'Offline',
        }));

        // Fetch from second API (Online)
        const response2 = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`);
        if (!response2.ok) throw new Error(`HTTP error! status: ${response2.status}`);
        const data2 = await response2.json();
        const onlineSuppliers: Supplier[] = (Array.isArray(data2) ? data2 : data2.data || []).map((supplier: any) => ({
          _id: supplier._id,
          name: supplier.name,
          type: 'Online',
        }));

        // Merge both supplier lists
        const mergedSuppliers = [...offlineSuppliers, ...onlineSuppliers];
        setSuppliers(mergedSuppliers);

        // Pre-select the supplier if one exists from reservation data
        // This block is now moved here, and it will only pre-select if a reservation providerId exists
        if (reservation?.providerId) {
          const initialSupplier = mergedSuppliers.find((sup: Supplier) => sup._id === reservation.providerId);
          if (initialSupplier) {
            setSelectedSupplier(initialSupplier);
            setSupplierId(initialSupplier._id); // Set supplierId for the form submission
            setSupplierName(initialSupplier.name); // Set supplierName for the form submission
          } else {
            // If reservation providerId doesn't match any fetched supplier, clear selection
            setSelectedSupplier(null);
            setSupplierId('');
            setSupplierName('');
          }
        } else {
          // If no reservation providerId, ensure nothing is pre-selected
          setSelectedSupplier(null);
          setSupplierId('');
          setSupplierName('');
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (isOpen) fetchSuppliers();
  }, [isOpen, reservation?.providerId]);

  if (!reservation || !calculatedPrices) return null;

  const handleSave = () => {
    onSave({
      supplierId: selectedSupplier?._id || '', // Ensure supplierId is empty if no supplier selected
      supplierName: selectedSupplier?.name || '', // Ensure supplierName is empty if no supplier selected
      basePrice, // This is the "New Price" entered by the user
      currency,
      markup, // Use the calculated markup
      commission,
      discount,
    });
  };

  // Calculate the commission value as a direct amount (not percentage)
  const calculateCommissionedPrice = (sellingPrice: number) => {
    const commissionAmount = parseFloat(commission);

    if (isNaN(commissionAmount) || commissionAmount <= 0) {
      return sellingPrice; // No commission applied or invalid commission
    }

    return sellingPrice - commissionAmount;
  };

  // Calculate the discount value as a direct amount (not percentage)
  const calculateDiscountedPrice = (sellingPrice: number) => {
    const discountAmount = parseFloat(discount);

    if (isNaN(discountAmount) || discountAmount <= 0) {
      return sellingPrice; // No discount applied or invalid discount
    }

    return sellingPrice - discountAmount;
  };

  // Calculate the final selling price considering both commission and discount
  const calculateFinalSellingPrice = () => {
    let priceAfterDiscount = calculatedPrices.sp; // Start with original selling price
    const discountAmount = parseFloat(discount);
    if (!isNaN(discountAmount) && discountAmount > 0) {
        priceAfterDiscount = priceAfterDiscount - discountAmount;
    }

    const commissionAmount = parseFloat(commission);
    if (!isNaN(commissionAmount) && commissionAmount > 0) {
        return priceAfterDiscount - commissionAmount;
    }
    return priceAfterDiscount;
  };


  const currentReservationDetails = [
    { label: 'Supplier Name', icon: FiUser, value: reservation.providerName },
    { label: 'Supplier Rate', icon: FiDollarSign, value: reservation.priceIssueNet.toFixed(2) },
    { label: 'Currency', icon: FiGlobe, value: reservation.currency },
    { label: 'Markup', icon: FiArrowUp, value: calculatedPrices.m.toFixed(2) },
    { label: 'Commission', icon: FiDollarSign, value: calculatedPrices.c.toFixed(2) },
    { label: 'Discount', icon: FiTag, value: calculatedPrices.d.toFixed(2) },
  ];

  const editablePriceDetails = [
    { label: 'New Price', icon: FiDollarSign, value: basePrice, onChange: setBasePrice, type: 'number', editable: true },
    { label: 'Currency', icon: FiGlobe, value: currency, onChange: setCurrency, type: 'text', editable: true },
    { label: 'Markup', icon: FiArrowUp, value: markup, onChange: setMarkup, type: 'number', editable: false },
    { label: 'Commission (Amount)', icon: FiDollarSign, value: commission, onChange: setCommission, type: 'number', editable: true },
    { label: 'Discount (Amount)', icon: FiTag, value: discount, onChange: setDiscount, type: 'number', editable: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            variants={modalVariants}
          >
            <header className="flex items-center justify-between px-6 py-3 border-b dark:border-gray-700 shrink-0">
              <h3 className="text-xl font-semibold flex items-center text-gray-800 dark:text-gray-100">
                <FiDollarSign className="mr-2 text-indigo-600" size={20} />
                Edit Reservation Price
              </h3>
              <button onClick={onClose} aria-label="Close">
                <FiX className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" size={20} />
              </button>
            </header>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 overflow-y-auto flex-grow">
              {/* Left Section: Current Reservation Details (Read-only) */}
              <div className="space-y-4">
                <h4 className="flex items-center text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FiTag className="mr-2 text-indigo-600" size={18} /> Current Details
                </h4>
                {currentReservationDetails.map(({ label, icon: Icon, value }) => (
                  <div key={label}>
                    <label className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Icon className="mr-2 text-gray-500" size={16} />
                      {label}
                    </label>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5">
                      <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">{value}</span>
                    </div>
                  </div>
                ))}
                {/* Selling Price on the Left Side */}
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiDollarSign className="mr-2 text-gray-500" size={16} />
                    Selling Price
                  </label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5">
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">
                      {calculateFinalSellingPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Editable Price Details and Supplier Dropdown */}
              <div className="space-y-4">
                <h4 className="flex items-center text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  <FiDollarSign className="mr-2 text-indigo-600" size={18} /> Edit Price
                </h4>

                {/* Supplier Name Dropdown */}
                <div>
                  <label htmlFor="supplier-select" className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiUser className="mr-2 text-gray-500" size={16} />
                    Supplier Name
                  </label>
                  <div className="relative">
                    <select
                      id="supplier-select"
                      className="block w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none pr-8 text-sm"
                      value={selectedSupplier?._id || ''} // Set value to empty string if no supplier is selected
                      onChange={(e) => {
                        const sup = suppliers.find(s => s._id === e.target.value);
                        setSelectedSupplier(sup || null);
                        setSupplierId(sup?._id || '');
                        setSupplierName(sup?.name || '');
                      }}
                    >
                      <option value="" disabled>Select a supplier</option> {/* Default disabled option */}
                      {suppliers.map((sup) => (
                        // Display name and type in a more "tag-like" format
                        <option key={sup._id} value={sup._id}>
                          {`${sup.name} [${sup.type}]`}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                      <FiChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Editable Price Fields */}
                {editablePriceDetails.map(({ label, icon: Icon, value, onChange, type, editable }) => (
                  <div key={label}>
                    <label className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Icon className="mr-2 text-gray-500" size={16} />
                      {label}
                    </label>
                    <div className={`flex items-center border rounded-md ${editable ? 'bg-gray-50 dark:bg-gray-700 focus-within:ring-2 focus-within:ring-indigo-500' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Icon className="ml-2 text-gray-400" size={16} />
                      <input
                        type={type}
                        min={type === 'number' ? "0" : undefined}
                        step={type === 'number' ? "0.01" : undefined}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-transparent focus:outline-none text-sm"
                        disabled={!editable} // Disable based on 'editable' prop
                      />
                    </div>
                  </div>
                ))}
                {/* Selling Price on the Right Side */}
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiDollarSign className="mr-2 text-gray-500" size={16} />
                    Selling Price
                  </label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5">
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">
                      {calculateFinalSellingPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <footer className="px-6 py-3 bg-white dark:bg-gray-800 flex justify-end space-x-3 border-t dark:border-gray-700 shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-1.5 border rounded-lg border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                <FiX size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
              >
                <FiCheck size={16} /> Save
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditPriceModal;