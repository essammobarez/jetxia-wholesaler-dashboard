"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Clock,
  DollarSign,
  Download,
  Mail,
  Phone,
  Printer,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  fetchAgencyData as fetchAgencyDataFromAPI,
  fetchRealBookingData,
  transformApiDataToOutstandingItems,
} from "./reportDataService";

interface AgencyOutstandingItem {
  id: string;
  bookingId: string;
  customerName: string;
  serviceType: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysPastDue: number;
  status: "pending" | "overdue" | "critical";
  clientRef: string;
  notes?: string;
}

interface AgencyStatementData {
  agencyId: string;
  agencyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  items: AgencyOutstandingItem[];
  totalOutstanding: number;
  totalOverdue: number;
  statementDate: string;
  statementNumber: string;
  website?: string;
  vat?: string;
  businessCurrency?: string;
}

interface AgencyData {
  _id: string;
  agencyName: string;
  totalOutstanding: number;
  itemCount: number;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  designation?: string;
  mobileNumber?: string;
  emailId?: string;
  city?: string;
  country?: string;
  postCode?: string;
  website?: string;
  vat?: string;
  businessCurrency?: string;
}

const AgencyOutstandingStatement: React.FC = () => {
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [statementData, setStatementData] =
    useState<AgencyStatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any[]>([]);
  const [agenciesData, setAgenciesData] = useState<AgencyData[]>([]);

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // Fetch real data from API
  const loadAgencyData = async () => {
    if (!wholesalerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Fetching agency data for wholesaler:", wholesalerId);

      // Fetch both booking and agency data
      const [bookingData, agencyData] = await Promise.all([
        fetchRealBookingData(wholesalerId),
        fetchAgencyDataFromAPI(wholesalerId),
      ]);

      console.log("API response for agency statement:", bookingData);
      console.log("Agency data from API:", agencyData);

      setApiData(bookingData);

      // Extract unique agencies from API data
      const allOutstanding = transformApiDataToOutstandingItems(bookingData);
      const agencyMap = new Map<string, AgencyData>();

      allOutstanding.forEach((item) => {
        const agencyId = item.agencyId;
        const agencyName = item.agencyName;

        if (!agencyMap.has(agencyId)) {
          agencyMap.set(agencyId, {
            _id: agencyId,
            agencyName: agencyName,
            totalOutstanding: 0,
            itemCount: 0,
          });
        }

        const agency = agencyMap.get(agencyId)!;
        agency.totalOutstanding += item.amount;
        agency.itemCount += 1;
      });

      // Merge agency details from API
      agencyData.forEach((apiAgency: any) => {
        const existingAgency = agencyMap.get(apiAgency._id);
        if (existingAgency) {
          // Update with detailed agency information
          existingAgency.contactPerson = `${apiAgency.title || ""} ${
            apiAgency.firstName || ""
          } ${apiAgency.lastName || ""}`.trim();
          existingAgency.email = apiAgency.emailId || apiAgency.email || "N/A";
          existingAgency.phone =
            apiAgency.mobileNumber || apiAgency.phoneNumber || "N/A";
          existingAgency.address = `${apiAgency.address || ""}, ${
            apiAgency.city || ""
          }, ${apiAgency.country || ""} ${apiAgency.postCode || ""}`.trim();
          existingAgency.firstName = apiAgency.firstName;
          existingAgency.lastName = apiAgency.lastName;
          existingAgency.title = apiAgency.title;
          existingAgency.designation = apiAgency.designation;
          existingAgency.mobileNumber = apiAgency.mobileNumber;
          existingAgency.emailId = apiAgency.emailId;
          existingAgency.city = apiAgency.city;
          existingAgency.country = apiAgency.country;
          existingAgency.postCode = apiAgency.postCode;
          existingAgency.website = apiAgency.website;
          existingAgency.vat = apiAgency.vat;
          existingAgency.businessCurrency = apiAgency.businessCurrency;
        }
      });

      const agencies = Array.from(agencyMap.values());
      setAgenciesData(agencies);
      console.log("Extracted agencies with details:", agencies);
    } catch (error) {
      console.error("Error fetching agency data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to fetch agency data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Load API data on component mount
  useEffect(() => {
    loadAgencyData();
  }, [wholesalerId]);

  const generateStatement = (agencyId: string) => {
    setLoading(true);

    // Get agency details from API data
    const agency = agenciesData.find((a) => a._id === agencyId);
    if (!agency) {
      setLoading(false);
      setError("Agency not found in API data");
      return;
    }

    // Get outstanding data for this agency from API data only
    if (apiData.length === 0) {
      setLoading(false);
      setError("No data available. Please refresh to load data from API.");
      return;
    }

    const allOutstanding = transformApiDataToOutstandingItems(apiData);
    const agencyOutstanding = allOutstanding.filter(
      (item) => item.agencyId === agencyId
    );

    // Calculate totals
    const totalOutstanding = agencyOutstanding.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalOverdue = agencyOutstanding
      .filter((item) => item.status === "overdue" || item.status === "critical")
      .reduce((sum, item) => sum + item.amount, 0);

    // Generate statement data
    const statement: AgencyStatementData = {
      agencyId: agency._id,
      agencyName: agency.agencyName,
      contactPerson: agency.contactPerson || "N/A",
      email: agency.email || "N/A",
      phone: agency.phone || "N/A",
      address: agency.address || "N/A",
      items: agencyOutstanding.map((item) => ({
        id: item.id,
        bookingId: item.bookingId,
        customerName: item.customerName,
        serviceType: item.serviceType,
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        amount: item.amount,
        currency: item.currency,
        dueDate: item.dueDate,
        daysPastDue: item.daysPastDue,
        status: item.status,
        clientRef: item.clientRef,
      })),
      totalOutstanding,
      totalOverdue,
      statementDate: new Date().toISOString().split("T")[0],
      statementNumber: `OS-${agency._id}-${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}`,
      website: agency.website,
      vat: agency.vat,
      businessCurrency: agency.businessCurrency,
    };

    setStatementData(statement);
    setLoading(false);
  };

  const exportToPDF = () => {
    if (!statementData) return;

    // Create printable content
    const printContent = `
OUTSTANDING STATEMENT

Statement #: ${statementData.statementNumber}
Date: ${new Date(statementData.statementDate).toLocaleDateString()}

AGENCY DETAILS:
${statementData.agencyName}
Contact: ${statementData.contactPerson}
Email: ${statementData.email}
Phone: ${statementData.phone}
Address: ${statementData.address}
${
  statementData.website && statementData.website !== "N/A"
    ? `Website: ${statementData.website}`
    : ""
}
${
  statementData.vat && statementData.vat !== "N/A"
    ? `VAT: ${statementData.vat}`
    : ""
}
${
  statementData.businessCurrency && statementData.businessCurrency !== "N/A"
    ? `Currency: ${statementData.businessCurrency}`
    : ""
}

OUTSTANDING ITEMS:
${statementData.items
  .map(
    (item) =>
      `Booking: ${item.bookingId}
  Customer: ${item.customerName}
  Service: ${item.serviceType}
  Period: ${item.checkIn} to ${item.checkOut}
  Amount: ${item.currency} ${item.amount.toLocaleString()}
  Due Date: ${item.dueDate}
  Status: ${item.status.toUpperCase()}
  Days Past Due: ${item.daysPastDue}
  Reference: ${item.clientRef}
  `
  )
  .join("\n---\n")}

SUMMARY:
Total Outstanding: ${
      statementData.items[0]?.currency || "USD"
    } ${statementData.totalOutstanding.toLocaleString()}
Total Overdue: ${
      statementData.items[0]?.currency || "USD"
    } ${statementData.totalOverdue.toLocaleString()}
Number of Items: ${statementData.items.length}

Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([printContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Outstanding-Statement-${statementData.agencyName.replace(
      /\s+/g,
      "-"
    )}-${statementData.statementDate}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printStatement = () => {
    if (!statementData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Outstanding Statement - ${statementData.agencyName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .agency-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .summary { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .overdue { color: #d32f2f; font-weight: bold; }
            .pending { color: #f57c00; }
            .amount { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OUTSTANDING STATEMENT</h1>
            <p>Statement #: ${statementData.statementNumber}</p>
            <p>Date: ${new Date(
              statementData.statementDate
            ).toLocaleDateString()}</p>
          </div>
          
          <div class="agency-details">
            <h3>Agency Details</h3>
            <p><strong>${statementData.agencyName}</strong></p>
            <p>Contact: ${statementData.contactPerson}</p>
            <p>Email: ${statementData.email}</p>
            <p>Phone: ${statementData.phone}</p>
            <p>Address: ${statementData.address}</p>
            ${
              statementData.website && statementData.website !== "N/A"
                ? `<p>Website: ${statementData.website}</p>`
                : ""
            }
            ${
              statementData.vat && statementData.vat !== "N/A"
                ? `<p>VAT: ${statementData.vat}</p>`
                : ""
            }
            ${
              statementData.businessCurrency &&
              statementData.businessCurrency !== "N/A"
                ? `<p>Currency: ${statementData.businessCurrency}</p>`
                : ""
            }
          </div>

          <h3>Outstanding Items</h3>
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Days Past Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${statementData.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.bookingId}</td>
                  <td>${item.customerName}</td>
                  <td>${item.serviceType}</td>
                  <td>${item.checkIn}</td>
                  <td>${item.checkOut}</td>
                  <td class="amount">${
                    item.currency
                  } ${item.amount.toLocaleString()}</td>
                  <td>${item.dueDate}</td>
                  <td class="${item.daysPastDue > 0 ? "overdue" : ""}">${
                    item.daysPastDue
                  }</td>
                  <td class="${item.status}">${item.status.toUpperCase()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Outstanding: ${
              statementData.items[0]?.currency || "USD"
            } ${statementData.totalOutstanding.toLocaleString()}</strong></p>
            <p><strong>Total Overdue: ${
              statementData.items[0]?.currency || "USD"
            } ${statementData.totalOverdue.toLocaleString()}</strong></p>
            <p>Number of Items: ${statementData.items.length}</p>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error Loading Data
              </h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              loadAgencyData();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!statementData) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Outstanding Statement Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate outstanding statements per agency from API data
            </p>
          </div>
          <button
            onClick={() => {
              setError(null);
              loadAgencyData();
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Agency Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Agency from API Data
          </h3>

          {agenciesData.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Agencies Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                No agencies with outstanding items found in API data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agenciesData.map((agency) => (
                <div
                  key={agency._id}
                  onClick={() => {
                    setSelectedAgency(agency._id);
                    generateStatement(agency._id);
                  }}
                  className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    agency.totalOutstanding > 0
                      ? "border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        agency.totalOutstanding > 0
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      <Building
                        className={`w-5 h-5 ${
                          agency.totalOutstanding > 0
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {agency.agencyName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agency.itemCount} outstanding items
                      </p>
                      {agency.totalOutstanding > 0 && (
                        <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                          Total Outstanding:{" "}
                          {agency.totalOutstanding.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setStatementData(null)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Agency Selection</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={printStatement}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statement Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            OUTSTANDING STATEMENT
          </h1>
          <div className="flex justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Statement #:{" "}
              <span className="font-medium">
                {statementData.statementNumber}
              </span>
            </div>
            <div>
              Date:{" "}
              <span className="font-medium">
                {new Date(statementData.statementDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Agency Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Agency Details
            </h3>
            <div className="space-y-2">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {statementData.agencyName}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="font-medium">Contact:</span>
                <span className="ml-2">{statementData.contactPerson}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span>{statementData.email}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>{statementData.phone}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {statementData.address}
              </div>
              {/* Additional agency details if available */}
              {statementData.website && statementData.website !== "N/A" && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Website:</span>{" "}
                  {statementData.website}
                </div>
              )}
              {statementData.vat && statementData.vat !== "N/A" && (
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">VAT:</span> {statementData.vat}
                </div>
              )}
              {statementData.businessCurrency &&
                statementData.businessCurrency !== "N/A" && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Currency:</span>{" "}
                    {statementData.businessCurrency}
                  </div>
                )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Outstanding:
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {statementData.items[0]?.currency || "USD"}{" "}
                  {statementData.totalOutstanding.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Overdue:
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {statementData.items[0]?.currency || "USD"}{" "}
                  {statementData.totalOverdue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Number of Items:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {statementData.items.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Outstanding Items Table */}
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Outstanding Items
          </h3>
          <table className="w-full border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                  Booking Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                  Service Period
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                  Due Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {statementData.items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-4 border-b">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.bookingId}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.serviceType}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Ref: {item.clientRef}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.customerName}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.checkIn}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      to {item.checkOut}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {item.currency} {item.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.dueDate}
                    </div>
                    {item.daysPastDue > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {item.daysPastDue} days overdue
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 border-b text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "overdue" || item.status === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {item.status === "overdue" ||
                      item.status === "critical" ? (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>Generated on: {new Date().toLocaleString()}</div>
            <div>Statement #{statementData.statementNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyOutstandingStatement;
