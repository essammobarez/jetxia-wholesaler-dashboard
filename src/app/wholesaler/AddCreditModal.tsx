import { useState } from 'react';

// Define the props for the component, including the new walletBalance object
interface AddCreditModalProps {
  onClose: () => void;
  agencyId: string;
  walletBalance: {
    mainBalance: number;
    availableCredit: number;
  };
}

const AddCreditModal = ({ onClose, agencyId, walletBalance }: AddCreditModalProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'MAIN' | 'CREDIT'>('MAIN');
  const [expireDate, setExpireDate] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({
    amount: '',
    description: '',
    expireDate: '',
  });

  // Form touched state (true after submit)
  const [formTouched, setFormTouched] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || "";
    }
    return "";
  };

  const validateFields = () => {
    const newErrors = {
      amount: '',
      description: '',
      expireDate: '',
    };
    let isValid = true;

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive amount.';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description cannot be empty.';
      isValid = false;
    }

    if (type === 'CREDIT') {
      const today = new Date();
      const selectedDate = expireDate ? new Date(expireDate) : null;

      if (!expireDate || !selectedDate || selectedDate <= today) {
        newErrors.expireDate = 'Expiry date must be a future date.';
        isValid = false;
      }
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true); // Mark form as touched to trigger error display
    setLoading(true);
    setSuccessMessage('');
    setError('');
    setFieldErrors({ amount: '', description: '', expireDate: '' });

    const token = getAuthToken();
    if (!token) {
      setError("Auth token missing. Please login again.");
      setLoading(false);
      return;
    }

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    const payload = {
      agencyId: agencyId,
      amount: parseFloat(amount),
      description: description.trim(),
      type: type,
      ...(type === 'CREDIT' && { expireDate }),
    };

    console.log(payload)

    try {
      const response = await fetch(`${API_URL}wallet/manual-credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMessage('Credit added successfully!');
        setAmount('');
        setDescription('');
        setType('MAIN');
        setExpireDate('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add credit.');
      }
    } catch (err) {
      setError('An error occurred while adding credit.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Add Credit Manually</h3>
          <button
            onClick={onClose}
            className="text-3xl text-gray-500 hover:text-gray-700 rounded-full"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Display Wallet Balance Section */}
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Current Wallet Balance</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Main Balance:</span>
            <span className="font-bold text-green-600">${walletBalance.mainBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Available Credit:</span>
            <span className="font-bold text-blue-600">${walletBalance.availableCredit.toFixed(2)}</span>
          </div>
        </div>

        {successMessage ? (
          <div className="mb-4 text-center text-green-600">{successMessage}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 text-center text-red-500">{error}</div>}

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (fieldErrors.amount) {
                    setFieldErrors((prev) => ({ ...prev, amount: '' }));
                  }
                }}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.amount ? 'border-red-500' : ''
                  }`}
              />
              {formTouched && fieldErrors.amount && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.amount}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Description"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.description ? 'border-red-500' : ''
                  }`}
              />
              {formTouched && fieldErrors.description && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.description}</p>
              )}
            </div>

            {/* Type Radio Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="MAIN"
                    checked={type === 'MAIN'}
                    onChange={() => setType('MAIN')}
                    className="mr-2"
                  />
                  MAIN
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="CREDIT"
                    checked={type === 'CREDIT'}
                    onChange={() => setType('CREDIT')}
                    className="mr-2"
                  />
                  CREDIT
                </label>
              </div>
            </div>

            {/* Expiry Date (only shown for CREDIT) */}
            {type === 'CREDIT' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expireDate}
                  onChange={(e) => {
                    setExpireDate(e.target.value);
                    if (fieldErrors.expireDate) {
                      setFieldErrors((prev) => ({ ...prev, expireDate: '' }));
                    }
                  }}
                  min={new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]} // tomorrow
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 appearance-none ${fieldErrors.expireDate ? 'border-red-500' : ''
                    }`}
                />
                {formTouched && fieldErrors.expireDate && (
                  <p className="mt-1 text-sm text-red-500">{fieldErrors.expireDate}</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddCreditModal;