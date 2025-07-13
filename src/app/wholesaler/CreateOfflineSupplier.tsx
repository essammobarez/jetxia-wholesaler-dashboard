import { City, Country } from "country-state-city";
import React, { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the shape of the option for react-select
interface Option {
  value: string;
  label: string;
  flag: string;
}

export default function CreateOfflineSupplier() {
  // Form State
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("");
  const [selectedNationality, setSelectedNationality] = useState<Option | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<Option | null>(null);
  const [selectedCity, setSelectedCity] = useState("");

  // Component State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wholesaler, setWholesaler] = useState<string>("");
  const [renderError, setRenderError] = useState<string>("");

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // Get data from library
  const countries = Country.getAllCountries();

  // Format countries for react-select
  const countryOptions: Option[] = countries.map((country) => ({
    value: country.isoCode,
    label: country.name,
    flag: country.isoCode,
  }));

  // Format nationalities for react-select (reusing the same country data)
  const nationalityOptions: Option[] = countries.map((country) => ({
    value: country.name,
    label: country.name,
    flag: country.isoCode,
  }));

  // Helper function to get cities of a country
  const getCities = (countryCode: string) => {
    return City.getCitiesOfCountry(countryCode) || [];
  };

  // Custom component to format the options with flags for react-select
  const formatOptionLabel = ({ label, flag }: Option) => (
    <div className="flex items-center">
      <ReactCountryFlag
        countryCode={flag}
        svg
        style={{ width: "1.5em", height: "1.5em", marginRight: "10px" }}
      />
      <span>{label}</span>
    </div>
  );

  useEffect(() => {
    if (wholesalerId) {
      setWholesaler(wholesalerId);
    }
  }, [wholesalerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation remains the same
    if (
      !name.trim() ||
      !phoneNumber ||
      !selectedNationality ||
      !selectedCountry
    ) {
      const errorMsg = "Please fill in all required fields marked with *";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const supplierData = {
      name: name.trim(),
      isActive: true,
      notes: notes.trim(),
      wholesaler: String(wholesaler),
      phoneNumber: phoneNumber || "",
      nationality: selectedNationality?.label || "",
      address: selectedCity,
    };

    setLoading(true);
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        const errorMsg = "Backend URL is not configured.";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const response = await fetch(`${backendUrl}/offline-provider/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Supplier created successfully!");
        // Reset form fields
        setName("");
        setNotes("");
        setPhoneNumber("");
        setSelectedNationality(null);
        setSelectedCountry(null);
        setSelectedCity("");
      } else {
        let errorMsg = "An unexpected error occurred. Please try again.";
        if (data && typeof data.message === "string") {
          errorMsg = data.message;
        }

        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "A network error occurred. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (renderError) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Error
        </h2>
        <div className="text-red-500 mb-4">{renderError}</div>
        <button
          onClick={() => setRenderError("")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Offline Supplier
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Add a new supplier to your network
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Supplier Information
            </h2>
          </div>
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-700 dark:text-red-400 font-medium">
                  {error}
                </span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Supplier Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="US" // <-- UPDATED FROM "BD" TO "US"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    className="phone-input-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Country *
                  </label>
                  <Select
                    value={selectedCountry}
                    onChange={(option) => {
                      setSelectedCountry(option as Option);
                      setSelectedCity("");
                    }}
                    options={countryOptions}
                    formatOptionLabel={formatOptionLabel}
                    placeholder="Select Country"
                    classNamePrefix="react-select"
                    isSearchable={true}
                    isClearable={true}
                    styles={{
                      control: (base) => ({
                        ...base,
                        padding: "0.5rem",
                        borderRadius: "0.75rem",
                        borderWidth: "1px",
                        backgroundColor: "var(--select-bg)",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "var(--select-color)",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 50,
                        backgroundColor: "var(--select-bg)",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "#2563eb"
                          : "transparent",
                        color: state.isFocused
                          ? "white"
                          : "var(--select-color)",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "var(--select-color)",
                      }),
                    }}
                    className="select-container"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedCountry}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50"
                  >
                    <option value="">Select City</option>
                    {selectedCountry &&
                      getCities(selectedCountry.value).map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="nationality"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nationality *
                </label>
                <Select
                  id="nationality"
                  value={selectedNationality}
                  onChange={(option) =>
                    setSelectedNationality(option as Option)
                  }
                  options={nationalityOptions}
                  formatOptionLabel={formatOptionLabel}
                  placeholder="Select Nationality"
                  classNamePrefix="react-select"
                  isSearchable={true}
                  isClearable={true}
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "0.5rem",
                      borderRadius: "0.75rem",
                      borderWidth: "1px",
                      backgroundColor: "var(--select-bg)",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "var(--select-color)",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 40,
                      backgroundColor: "var(--select-bg)",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? "#2563eb"
                        : "transparent",
                      color: state.isFocused ? "white" : "var(--select-color)",
                    }),
                    input: (base) => ({
                      ...base,
                      color: "var(--select-color)",
                    }),
                  }}
                  className="select-container"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gamma-700 dark:text-gray-100 resize-none"
                  placeholder="Enter additional notes (optional)"
                />
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Supplier
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx global>{`
        :root {
          --select-bg: white;
          --select-color: #1f2937;
        }
        .dark {
          --select-bg: #374151;
          --select-color: #f9fafb;
        }
        .react-select__control {
          background-color: var(--select-bg) !important;
          border-color: #d1d5db !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        }
        .dark .react-select__control {
          border-color: #4b5563 !important;
        }
        .react-select__control--is-focused {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px #3b82f6 !important;
        }
        .react-select__single-value,
        .react-select__input-container {
          color: var(--select-color) !important;
        }
        .react-select__menu {
          background-color: var(--select-bg) !important;
          z-index: 50;
        }
        .react-select__option--is-focused {
          background-color: #2563eb !important;
          color: white !important;
        }
        .react-select__option--is-selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        .phone-input-container {
          height: 50px;
          display: flex;
          align-items: center;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          transition: all 0.2s ease-in-out;
          background-color: white;
          padding-left: 0.5rem;
        }
        .dark .phone-input-container {
          background-color: #374151;
          border-color: #4b5563;
        }
        .phone-input-container:focus-within {
          box-shadow: 0 0 0 2px #3b82f6;
          border-color: #3b82f6;
        }
        .PhoneInputCountry {
          padding-right: 0.5rem;
        }
        .PhoneInputInput {
          height: 100%;
          border: none;
          outline: none;
          background-color: transparent;
          font-size: 1rem;
          color: #111827;
        }
        .dark .PhoneInputInput {
          color: #f9fafb;
        }
        .PhoneInputCountrySelect:focus {
          outline: none;
        }
        .PhoneInputCountrySelect-menu {
          z-index: 51 !important;
        }
      `}</style>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
