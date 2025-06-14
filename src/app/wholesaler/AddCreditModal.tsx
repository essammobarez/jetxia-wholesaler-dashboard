import { useState } from 'react';

const AddCreditModal = ({ onClose, agencyId }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || "";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setError('');
    const token = getAuthToken();
    if (!token) {
      setError("Auth token missing. Please login again.");
      setLoading(false);
      return;
    }
    // Trim description to avoid accidental whitespace
    const trimmedDescription = description.trim();

    // Validate inputs
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      setLoading(false);
      return;
    }

    if (!trimmedDescription) {
      setError('Description cannot be empty.');
      setLoading(false);
      return;
    }

    const payload = {
      agencyId,
      amount: parseFloat(amount),
      description: trimmedDescription,
    };

    try {
      const response = await fetch(`${API_URL}wallet/manual-credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMessage('Credit added successfully!');
        setAmount('');
        setDescription('');
      } else {
        const errorData = await response.json();
        setSuccessMessage('');
        setError(errorData.message || 'Failed to add credit.');
      }
    } catch (err) {
      setError('An error occurred while adding credit.');
      setSuccessMessage('');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle click on overlay
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
        {/* Close button on top right */}

        <div className="flex justify-between items-center  mb-4">
          <h3 className="text-xl font-semibold">Add Credit Manually</h3>
          <button
            onClick={onClose}
            className=" top-4 right-4 text-3xl text-gray-500 hover:text-gray-700 rounded-full"
            aria-label="Close"
          >
            &times;
          </button>

        </div>

        {successMessage ? (
          <div className="mb-4 text-center text-green-600">{successMessage}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="mb-4 text-center text-red-500">{error}</div>}

            {/* Amount input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
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