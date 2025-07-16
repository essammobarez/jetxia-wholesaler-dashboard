// /components/CreateSalesForm.tsx
"use client";

import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  FaUser,
  FaPhone,
  FaLock,
  FaCheckCircle,
  FaClipboard,
  FaUserPlus,
} from "react-icons/fa";

interface SalesFormData {
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    [key: string]: any;
  };
}

const CreateSalesForm: React.FC = () => {
  const [formData, setFormData] = useState<SalesFormData>({
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    if (message) setMessage("");
    if (typeof e === "string") {
      setFormData(prev => ({ ...prev, phone: e }));
    } else {
      const { name: key, value } = e.target;
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCopy = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`)
      .then(() => {
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
      setMessage("Authorization failed. Please log in again.");
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sales/create-sales`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const result: ApiResponse = await res.json();

      if (res.ok && result.data?.email) {
        setCredentials({ email: result.data.email, password: formData.password });
        setFormData({ firstName: "", lastName: "", password: "", phone: "" });
      } else {
        setIsError(true);
        setMessage(result.message || "An unexpected error occurred.");
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (credentials) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center space-y-6">
          <FaCheckCircle className="mx-auto text-green-500 text-4xl" />
          <h2 className="text-2xl font-semibold text-gray-800">User Created!</h2>
          <p className="text-gray-600">Share these credentials with the new salesperson:</p>
          <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-left">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800 break-words">{credentials.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Password</p>
              <p className="font-medium text-gray-800 break-words">{credentials.password}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
                isCopied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <FaClipboard /> {isCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => setCredentials(null)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition"
            >
              <FaUserPlus /> Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <FaUserPlus className="mx-auto text-blue-600 text-4xl" />
          <h1 className="text-3xl font-bold text-gray-800">Add Salesperson</h1>
          <p className="text-gray-500">Fill in the details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-gray-400" />
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="First Name"
                className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-gray-400" />
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="Last Name"
                className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="relative w-full">
            <FaPhone className="absolute top-3 left-3 text-gray-400" />
            <PhoneInput
              country="us"
              inputProps={{
                name: "phone",
                required: true,
              }}
              value={formData.phone}
              onChange={value => handleChange(value)}
              disabled={loading}
              containerClass="w-full"
              flagClass="hidden"
              inputStyle={{
                width: "100%",
                height: "3rem",
                paddingLeft: "3rem",
                borderRadius: "0.5rem",
                border: "1px solid #D1D5DB",
                outline: "none",
              }}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              placeholder="Password"
              className="pl-10 w-full py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-500 transition disabled:bg-blue-300"
          >
            {loading ? "Creating..." : <><FaUserPlus /> Create</>}
          </button>

          {message && isError && (
            <p className="text-center text-red-600 text-sm">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateSalesForm;
