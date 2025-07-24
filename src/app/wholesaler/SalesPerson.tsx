// SalesManagementPage.tsx
'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FaUser,
  FaPhone,
  FaLock,
  FaCheckCircle,
  FaClipboard,
  FaUserPlus,
  FaEnvelope,
  FaPercentage,
  FaUsers,
  FaTimes,
  FaPencilAlt,
  FaSave,
} from "react-icons/fa";

// --- INTERFACES ---
interface SalesFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  commissionRate: number;
}
interface SalesFormState extends Omit<SalesFormData, "commissionRate"> {
  commissionRate: string;
}
interface SalesUser {
  _id: string;
  username: string;
  email: string;
  phone: string;
  commissionRate?: number;
  createdAt: string;
}
interface CreateApiResponse {
  success: boolean;
  message: string;
  data?: { email: string; [key: string]: any };
}
interface ListApiResponse {
  success: boolean;
  message: string;
  data?: SalesUser[];
}
interface UpdateApiResponse {
  success: boolean;
  message: string;
}

// --- ADD SALESPERSON MODAL ---
const AddSalespersonModal = memo(({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [formData, setFormData] = useState<SalesFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    commissionRate: "0.05",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const firstNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      firstNameRef.current?.focus();
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | string) => {
      if (typeof e === "string") {
        setFormData(prev => ({ ...prev, phone: e }));
      } else {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    },
    []
  );

  const handleCopy = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(
      `Email: ${credentials.email}\nPassword: ${credentials.password}`
    ).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    const token =
      document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
      localStorage.getItem("authToken");
    if (!token) {
      setIsError(true);
      setMessage("Authorization failed. Please log in again.");
      setLoading(false);
      return;
    }
    const apiPayload: SalesFormData = {
      ...formData,
      commissionRate: parseFloat(formData.commissionRate) || 0,
    };
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sales/create-sales`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(apiPayload),
        }
      );
      const result: CreateApiResponse = await res.json();
      if (res.ok && result.data?.email) {
        setCredentials({ email: result.data.email, password: formData.password });
        onCreated();
      } else {
        setIsError(true);
        setMessage(result.message || "An unexpected error occurred.");
      }
    } catch {
      setIsError(true);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
        <div className="p-8">
          {credentials ? (
            <div className="text-center space-y-6">
              <FaCheckCircle className="mx-auto text-green-500 text-5xl" />
              <h2 className="text-2xl font-semibold text-gray-800">User Created!</h2>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-left">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800 break-words">{credentials.email}</p>
                <p className="text-sm text-gray-500">Password</p>
                <p className="font-medium text-gray-800 break-words">{credentials.password}</p>
              </div>
              <div className="flex sm:flex-row flex-col gap-3">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition ${
                    isCopied
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <FaClipboard /> {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => {
                    setCredentials(null);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      password: "",
                      phone: "",
                      commissionRate: "0.05",
                    });
                  }}
                  className="flex-1 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition flex items-center justify-center gap-2"
                >
                  <FaUserPlus /> Create Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                <div className="relative">
                  <FaUser className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    ref={firstNameRef}
                    autoFocus
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First Name"
                    className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                  />
                </div>
                <div className="relative">
                  <FaUser className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last Name"
                    className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>
              <div className="relative">
                <FaEnvelope className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email Address"
                  className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="relative">
               
                <PhoneInput
                  country="us"
                  inputProps={{ name: "phone", required: true }}
                  value={formData.phone}
                  onChange={value => handleChange(value)}
                  containerClass="w-full"
                  inputStyle={{
                    width: "100%",
                    height: "3rem",
                    paddingLeft: "2.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #D1D5DB"
                  }}
                  buttonStyle={{
                    borderTopLeftRadius: "0.5rem",
                    borderBottomLeftRadius: "0.5rem"
                  }}
                />
              </div>
              <div className="relative">
                <FaLock className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                />
              </div>
              <div className="relative">
                <FaPercentage className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  name="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  required
                    placeholder="Commission Rate (e.g., 0.05)"
                    className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-500 transition disabled:bg-blue-300"
              >
                {loading ? "Creating..." : <><FaUserPlus /> Create</>}
              </button>
              {message && (
                <p className={`text-center text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

// --- SALES LIST & EDIT MODAL ---
const SalesManagementPage: React.FC = () => {
  const [salesList, setSalesList] = useState<SalesUser[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SalesUser | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [isEditError, setIsEditError] = useState(false);

  const commissionInputRef = useRef<HTMLInputElement>(null);

  const fetchSalesList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    const token =
      document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
      localStorage.getItem("authToken");
    if (!token) {
      setListError("Authorization failed. Please log in again.");
      setListLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sales/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result: ListApiResponse = await res.json();
      if (res.ok && result.data) {
        setSalesList(result.data);
      } else {
        setListError(result.message || "Failed to fetch sales list.");
      }
    } catch {
      setListError("Network error while fetching list. Please try again.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesList();
  }, [fetchSalesList]);

  const handleOpenAddModal = () => setAddModalOpen(true);
  const handleCloseAddModal = () => setAddModalOpen(false);
  const handleAddCreated = () => {
    fetchSalesList();
  };

  const handleOpenEditModal = (user: SalesUser) => {
    setEditingUser(user);
    setNewCommissionRate(user.commissionRate?.toString() || "0");
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditMessage("");
    setIsEditError(false);
  };

  // Re-focus on every value change so it never blurs.
  useEffect(() => {
    if (isEditModalOpen) {
      commissionInputRef.current?.focus();
    }
  }, [isEditModalOpen, newCommissionRate]);

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditLoading(true);
    setEditMessage("");
    setIsEditError(false);
    const token =
      document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
      localStorage.getItem("authToken");
    if (!token) {
      setEditMessage("Authorization failed.");
      setIsEditError(true);
      setEditLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sales/${editingUser._id}/commission`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rate: parseFloat(newCommissionRate) })
        }
      );
      const result: UpdateApiResponse = await res.json();
      if (res.ok) {
        setEditMessage("Commission updated successfully!");
        fetchSalesList();
        setTimeout(handleCloseEditModal, 1500);
      } else {
        setEditMessage(result.message || "Failed to update commission.");
        setIsEditError(true);
      }
    } catch {
      setEditMessage("A network error occurred.");
      setIsEditError(true);
    } finally {
      setEditLoading(false);
    }
  };

  const SalesListSection = () => (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-gray-700 text-3xl" />
          <h1 className="text-3xl font-bold text-gray-800">Sales Team</h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition shadow-md"
        >
          <FaUserPlus /> Add Salesperson
        </button>
      </div>
      {listLoading ? (
        <p className="text-center text-gray-500 py-10">Loading list...</p>
      ) : listError ? (
        <p className="text-center text-red-600 bg-red-50 p-4 rounded-lg">{listError}</p>
      ) : salesList.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No sales users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesList.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.commissionRate !== undefined
                      ? `${(user.commissionRate * 100).toFixed(0)}%`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition"
                      title="Edit Commission"
                    >
                      <FaPencilAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const EditCommissionModal = () => {
    if (!isEditModalOpen || !editingUser) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <button
            onClick={handleCloseEditModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
          <div className="p-8">
            <div className="text-center mb-6 space-y-2">
              <FaPencilAlt className="mx-auto text-blue-600 text-4xl" />
              <h1 className="text-3xl font-bold text-gray-800">Edit Commission</h1>
              <p className="text-gray-500">
                Updating for <span className="font-semibold">{editingUser.username}</span>
              </p>
            </div>
            <form onSubmit={handleUpdateCommission} className="space-y-5">
              <div className="relative">
                <FaPercentage className="absolute top-3.5 left-3 text-gray-400" />
                <input
                  ref={commissionInputRef}
                  autoFocus
                  name="newCommissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(e.target.value)}
                  disabled={editLoading}
                  required
                  placeholder="New Commission Rate (e.g., 0.10)"
                  className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={editLoading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-500 transition disabled:bg-blue-300"
              >
                {editLoading ? "Updating..." : <><FaSave /> Update Commission</>}
              </button>
              {editMessage && (
                <p className={`text-center text-sm ${isEditError ? 'text-red-600' : 'text-green-600'}`}>
                  {editMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <SalesListSection />
      <AddSalespersonModal
        isOpen={addModalOpen}
        onClose={handleCloseAddModal}
        onCreated={handleAddCreated}
      />
      <EditCommissionModal />
    </div>
  );
};

export default SalesManagementPage;
