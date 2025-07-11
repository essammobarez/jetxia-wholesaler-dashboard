import React, { useEffect, useRef, useState, useCallback, Fragment } from 'react';
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
  FiWifi, // Icon for Online
} from 'react-icons/fi';
import { MdWifiOff } from 'react-icons/md'; // Import MdWifiOff for Offline suppliers
import { Listbox, Transition } from '@headlessui/react'; // Using Headless UI for an accessible custom select

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
      // Discount and Commission adjustments
      const discountAmount = parseFloat(discount);
      const commissionAmount = parseFloat(commission);

      let adjustedPrice = originalBasePrice;

      // Adjusting price based on discount
      if (!isNaN(discountAmount) && discountAmount > 0) {
        adjustedPrice -= discountAmount;
      }

      // Adjusting price based on commission
      if (!isNaN(commissionAmount) && commissionAmount > 0) {
        adjustedPrice -= commissionAmount;
      }

      // Calculate markup based on the adjusted price
      const newCalculatedMarkup = originalMarkup + (adjustedPrice - newPriceValue);
      setMarkup(newCalculatedMarkup.toFixed(2));
    } else {
      // If "New Price" is empty or invalid, revert to original markup or a default
      setMarkup(originalMarkup !== 0 ? originalMarkup.toFixed(2) : '0.00');
    }
  }, [basePrice, discount, commission]); // Depend on basePrice, discount, and commission

  // Effect to re-calculate markup whenever basePrice (New Price), discount, or commission changes
  useEffect(() => {
    calculateMarkup();
  }, [calculateMarkup]);

  // Initialize states when modal opens or reservation data changes
  useEffect(() => {
    if (isOpen && reservation && calculatedPrices) {
      setBasePrice(''); // Always initialize "New Price" as empty for user input
      originalBasePriceRef.current = reservation.priceIssueNet;
      originalMarkupRef.current = calculatedPrices.m;
      setCurrency(reservation.currency);
      setMarkup(calculatedPrices.m.toFixed(2));
      setCommission(calculatedPrices.c.toFixed(2));
      setDiscount(calculatedPrices.d.toFixed(2));
      setSelectedSupplier(null); // Ensure "Select a supplier" is default
      setSupplierId('');
      setSupplierName('');
    } else if (!isOpen) {
      setSupplierId('');
      setSupplierName('');
      setBasePrice('');
      setCurrency('');
      setMarkup('');
      setCommission('');
      setDiscount('');
      setSelectedSupplier(null); // Ensure "Select a supplier" is default
      originalBasePriceRef.current = 0;
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

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const wholesalerId = '6857c852462871f5be84204c';
        const response1 = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offline-provider/by-wholesaler/${wholesalerId}`);
        if (!response1.ok) throw new Error(`HTTP error! status: ${response1.status}`);
        const data1 = await response1.json();
        const offlineSuppliers: Supplier[] = (Array.isArray(data1) ? data1 : data1.data || []).map((supplier: any) => ({
          _id: supplier._id,
          name: supplier.name,
          type: 'Offline',
        }));

        const response2 = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provider`);
        if (!response2.ok) throw new Error(`HTTP error! status: ${response2.status}`);
        const data2 = await response2.json();
        const onlineSuppliers: Supplier[] = (Array.isArray(data2) ? data2 : data2.data || []).map((supplier: any) => ({
          _id: supplier._id,
          name: supplier.name,
          type: 'Online',
        }));

        const mergedSuppliers = [...offlineSuppliers, ...onlineSuppliers];
        setSuppliers(mergedSuppliers);
        setSelectedSupplier(null); // Ensure "Select a supplier" is default
        setSupplierId('');
        setSupplierName('');
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (isOpen) fetchSuppliers();
  }, [isOpen]);

  if (!reservation || !calculatedPrices) return null;

  const handleSave = () => {
    onSave({
      supplierId: selectedSupplier?._id || '',
      supplierName: selectedSupplier?.name || '',
      basePrice,
      currency,
      markup,
      commission,
      discount,
    });
  };

  const calculateFinalSellingPrice = () => {
    let priceAfterDiscount = calculatedPrices.sp;
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            variants={modalVariants}
          >
            <header className="flex items-center justify-between px-6 py-3 border-b dark:border-gray-700 shrink-0">
              <h3 className="text-xl font-semibold flex items-center text-gray-800 dark:text-gray-100">
                <FiDollarSign className="mr-2 text-indigo-600" size={20} />
                Edit Reservation Price
              </h3>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" size={20} />
              </button>
            </header>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-8 overflow-y-auto flex-grow">
              {/* Left Section: Current Reservation Details (Read-only) */}
              <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner border border-gray-200 dark:border-gray-600">
                <h4 className="flex items-center text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                  <FiTag className="mr-2 text-blue-500" size={20} /> Current Details
                </h4>
                <div className="space-y-4">
                  {currentReservationDetails.map(({ label, icon: Icon, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Icon className="mr-2 text-gray-500" size={18} />
                        {label}
                      </label>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <FiDollarSign className="mr-2 text-gray-500" size={18} />
                      Selling Price
                    </label>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {calculatedPrices.sp.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Editable Price Details and Supplier Dropdown */}
              <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h4 className="flex items-center text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <FiDollarSign className="mr-2 text-green-500" size={20} /> Edit Price
                </h4>
                <div className="space-y-5">
                  {/* Supplier Name Custom Dropdown */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiUser className="mr-2 text-gray-500" size={18} />
                      Supplier Name
                    </label>
                    <Listbox
                      value={selectedSupplier}
                      onChange={(sup: Supplier | null) => {
                        setSelectedSupplier(sup);
                        setSupplierId(sup?._id || '');
                        setSupplierName(sup?.name || '');
                      }}
                    >
                      {({ open }) => (
                        <div className="relative">
                          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-50 dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 shadow-sm focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-base">
                            <span className={`block truncate ${selectedSupplier ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                              {selectedSupplier ? (
                                <span className="flex items-center gap-2">
                                  {selectedSupplier.type === 'Online' ? <FiWifi className="text-indigo-500" size={18} /> : <MdWifiOff className="text-red-500" size={18} />}
                                  {selectedSupplier.name}
                                </span>
                              ) : (
                                'Select a supplier'
                              )}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <FiChevronDown
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                              {suppliers.map((supplier) => (
                                <Listbox.Option
                                  key={supplier._id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-gray-100'
                                    }`
                                  }
                                  value={supplier}
                                >
                                  {({ selected }) => (
                                    <span className={`flex items-center gap-2 ${selected ? 'font-semibold' : 'font-normal'}`}>
                                      {supplier.type === 'Online' ? <FiWifi className="text-indigo-500" size={18} /> : <MdWifiOff className="text-red-500" size={18} />}
                                      {supplier.name}
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                          <FiCheck className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </span>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      )}
                    </Listbox>
                  </div>

                  {/* Editable Price Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editablePriceDetails.map(({ label, icon: Icon, value, onChange, type, editable }) => (
                      <div key={label}>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Icon className="mr-2 text-gray-500" size={18} />
                          {label}
                        </label>
                        <div className={`flex items-center border rounded-lg overflow-hidden transition-all duration-200 ${editable ? 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700'}`}>
                          <span className="flex items-center pl-3 pr-2 text-gray-400 dark:text-gray-500">
                            <Icon size={18} />
                          </span>
                          <input
                            type={type}
                            min={type === 'number' ? "0" : undefined}
                            step={type === 'number' ? "0.01" : undefined}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 px-2 py-2 bg-transparent focus:outline-none text-base text-gray-800 dark:text-gray-100"
                            disabled={!editable}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Discount (Amount) and Selling Price (Calculated) in the same row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FiTag className="mr-2 text-gray-500" size={18} />
                        Discount (Amount)
                      </label>
                      <div className={`flex items-center border rounded-lg overflow-hidden transition-all duration-200 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500`}>
                        <span className="flex items-center pl-3 pr-2 text-gray-400 dark:text-gray-500">
                          <FiTag size={18} />
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="flex-1 px-2 py-2 bg-transparent focus:outline-none text-base text-gray-800 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FiDollarSign className="mr-2 text-gray-500" size={18} />
                        Selling Price (Calculated)
                      </label>
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                        <span className="flex-1 text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {calculateFinalSellingPrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3 border-t dark:border-gray-700 shrink-0">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 border rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-base font-medium shadow-sm"
              >
                <FiX size={18} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-base font-medium shadow-md transition-colors duration-200"
              >
                <FiCheck size={18} /> Save Changes
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditPriceModal;
