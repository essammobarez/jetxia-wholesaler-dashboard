"use client";

import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface StatementEntry {
  id: string;
  date: string;
  description: string;
  bookingId: string;
  reference: string;
  debit: number;
  credit: number;
  runningBalance: number;
  rawDebit: number;
  rawCredit: number;
  rawBalance: number;
}

interface AccountStatement {
  agencyId: string;
  agencyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  statementPeriod: {
    from: string;
    to: string;
  };
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  currency: string;
  entries: StatementEntry[];
  paymentTerms: string;
  creditLimit: number;
  status: "active" | "suspended" | "warning";
}

const StatementOfAccount: React.FC = () => {
  const [statements, setStatements] = useState<AccountStatement[]>([]);
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [selectedStatement, setSelectedStatement] =
    useState<AccountStatement | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<
    Array<{ id: string; agencyName: string }>
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [wholesalerId, setWholesalerId] = useState<string | null>(null);
  
  // Additional filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("agencyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStatements, setTotalStatements] = useState(0);
  const [statementsPerPage] = useState(6);
  
  // Statement details pagination
  const [currentDetailsPage, setCurrentDetailsPage] = useState(1);
  const [totalDetailsPages, setTotalDetailsPages] = useState(1);
  const [detailsPerPage] = useState(10);

  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  useEffect(() => {
    const fetchStatementData = async () => {
      if (!wholesalerId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
        const startDate = `${selectedMonth}-01`;
        const endDate = new Date(
          new Date(startDate).getFullYear(),
          new Date(startDate).getMonth() + 1,
          0
        )
          .toISOString()
          .split("T")[0];

        const token =
          document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
          localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Authorization failed. Please log in again.");
        }

        const response = await fetch(
          `${apiUrl}/statements/wholesaler/agencies?startDate=${startDate}&endDate=${endDate}&page=${currentPage}&limit=${statementsPerPage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        const data = result.data || [];
        
        // Update pagination info
        setTotalPages(result.totalPages || 1);
        setTotalStatements(result.total || data.length);

        const mappedStatements: AccountStatement[] = data.map((item: any) => {
          const closingBalance = item.summary?.closingBalance || 0;
          let status: "active" | "suspended" | "warning" = "active";
          if (closingBalance < -1000) {
            status = "suspended";
          } else if (closingBalance < -500) {
            status = "warning";
          }

          return {
            agencyId: item.agency?.id,
            agencyName: item.agency?.name,
            contactName: item.agency?.name || "Contact Person",
            email: item.agency?.email || "contact@agency.com",
            phone: "+1234567890", // not provided in API
            address: "Agency Address", // placeholder
            statementPeriod: {
              from: item.period?.startDate || startDate,
              to: item.period?.endDate || endDate,
            },
            openingBalance: item.summary?.openingBalance || 0,
            closingBalance: item.summary?.closingBalance || 0,
            totalDebits: item.summary?.totalDebits || 0,
            totalCredits: item.summary?.totalCredits || 0,
            currency: item.summary?.currency || "USD",
            entries: [], // no transaction-level data in this endpoint
            paymentTerms: "30 days",
            creditLimit: 5000, // static for now
            status,
          };
        });

        const uniqueAgencies = mappedStatements.map((s) => ({
          id: s.agencyId,
          agencyName: s.agencyName,
        }));

        setAgencies(uniqueAgencies);
        setStatements(mappedStatements);
      } catch (error) {
        console.error("Error fetching statement data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        setStatements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStatementData();
  }, [selectedMonth, wholesalerId, currentPage]);

  const filteredStatements = statements.filter((s) => {
    const matchesAgency = selectedAgency === "all" || s.agencyId === selectedAgency;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesBalance = (() => {
      switch (balanceFilter) {
        case "positive":
          return s.closingBalance > 0;
        case "negative":
          return s.closingBalance < 0;
        case "zero":
          return s.closingBalance === 0;
        default:
          return true;
      }
    })();
    const matchesSearch = searchTerm === "" || 
      s.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAgency && matchesStatus && matchesBalance && matchesSearch;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case "agencyName":
        aValue = a.agencyName.toLowerCase();
        bValue = b.agencyName.toLowerCase();
        break;
      case "closingBalance":
        aValue = a.closingBalance;
        bValue = b.closingBalance;
        break;
      case "totalDebits":
        aValue = a.totalDebits;
        bValue = b.totalDebits;
        break;
      case "totalCredits":
        aValue = a.totalCredits;
        bValue = b.totalCredits;
        break;
      default:
        aValue = a.agencyName.toLowerCase();
        bValue = b.agencyName.toLowerCase();
    }
    
    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "suspended":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "suspended":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };


  const exportStatementToCSV = (statement: AccountStatement) => {
    const headers = [
      "Date",
      "Description", 
      "Reference",
      "Debit",
      "Credit",
      "Balance"
    ];

    const csvData = [
      // Opening Balance
      [
        new Date(statement.statementPeriod.from).toLocaleDateString(),
        "Opening Balance",
        "-",
        statement.openingBalance >= 0 ? "" : `${statement.currency} ${Math.abs(statement.openingBalance).toFixed(2)}`,
        statement.openingBalance >= 0 ? `${statement.currency} ${statement.openingBalance.toFixed(2)}` : "",
        `${statement.currency} ${statement.openingBalance.toFixed(2)}`
      ],
      // Transaction entries
      ...statement.entries.map(entry => [
        entry.date,
        entry.description,
        entry.reference,
        entry.debit > 0 ? `${statement.currency} ${entry.debit.toFixed(2)}` : "",
        entry.credit > 0 ? `${statement.currency} ${entry.credit.toFixed(2)}` : "",
        `${statement.currency} ${entry.runningBalance.toFixed(2)}`
      ]),
      // Closing Balance
      [
        new Date(statement.statementPeriod.to).toLocaleDateString(),
        "Closing Balance",
        "-",
        statement.totalDebits > 0 ? `${statement.currency} ${statement.totalDebits.toFixed(2)}` : "",
        statement.totalCredits > 0 ? `${statement.currency} ${statement.totalCredits.toFixed(2)}` : "",
        `${statement.currency} ${statement.closingBalance.toFixed(2)}`
      ]
    ];

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement-${statement.agencyName.replace(/\s+/g, "-")}-${statement.statementPeriod.from}-to-${statement.statementPeriod.to}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAllStatementsToCSV = () => {
    const headers = [
      "Agency",
      "Period From",
      "Period To", 
      "Opening Balance",
      "Closing Balance",
      "Total Debits",
      "Total Credits",
      "Net Amount",
      "Currency",
      "Status"
    ];

    const csvData = statements.map(statement => [
      statement.agencyName,
      statement.statementPeriod.from,
      statement.statementPeriod.to,
      `${statement.currency} ${statement.openingBalance.toFixed(2)}`,
      `${statement.currency} ${statement.closingBalance.toFixed(2)}`,
      `${statement.currency} ${statement.totalDebits.toFixed(2)}`,
      `${statement.currency} ${statement.totalCredits.toFixed(2)}`,
      `${statement.currency} ${(statement.closingBalance - statement.openingBalance).toFixed(2)}`,
      statement.currency,
      statement.status.toUpperCase()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-statements-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Simple page change handlers
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleDetailsPageChange = (page: number) => setCurrentDetailsPage(page);

  // Handler for opening view details
  const handleViewDetails = async (statement: AccountStatement) => {
    setLoadingDetails(statement.agencyId); // Show loading on specific button
    setCurrentDetailsPage(1); // Reset to first page when opening details
    
    try {
      const token =
        document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
        localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authorization failed. Please log in again.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      const startDate = statement.statementPeriod.from;
      const endDate = statement.statementPeriod.to;

      const response = await fetch(
        `${apiUrl}/statements/agency/${statement.agencyId}/table?startDate=${startDate}&endDate=${endDate}&page=1&limit=${detailsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data;

      if (data && data.entries) {
        setTotalDetailsPages(result.totalPages || 1);
        const updatedStatement = {
          ...statement,
          entries: data.entries.map((entry: any, index: number) => ({
            id: entry.reference || `entry-${index}`,
            date: entry.date,
            description: entry.description,
            bookingId: entry.reference,
            reference: entry.reference,
            debit: entry.rawDebit || 0,
            credit: entry.rawCredit || 0,
            runningBalance: entry.rawBalance || 0,
            rawDebit: entry.rawDebit || 0,
            rawCredit: entry.rawCredit || 0,
            rawBalance: entry.rawBalance || 0,
          })),
          openingBalance: data.summary?.openingBalance || 0,
          closingBalance: data.summary?.closingBalance || 0,
          totalDebits: data.summary?.totalDebits || 0,
          totalCredits: data.summary?.totalCredits || 0,
          currency: data.summary?.currency || "USD",
        };
        // Only open modal after data is successfully fetched
        setSelectedStatement(updatedStatement);
      }
    } catch (error) {
      console.error("Error fetching statement details:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch statement details");
    } finally {
      setLoadingDetails(null); // Hide loading after fetch completes
    }
  };

  // Effect to fetch details when page changes (only when modal is open)
  useEffect(() => {
    if (!selectedStatement || currentDetailsPage === 1) return;
    
    const fetchDetailsPage = async () => {
      setLoadingDetails(selectedStatement.agencyId);
      
      try {
        const token =
          document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] ||
          localStorage.getItem("authToken");

        if (!token) {
          throw new Error("Authorization failed. Please log in again.");
        }

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
        const startDate = selectedStatement.statementPeriod.from;
        const endDate = selectedStatement.statementPeriod.to;

        const response = await fetch(
          `${apiUrl}/statements/agency/${selectedStatement.agencyId}/table?startDate=${startDate}&endDate=${endDate}&page=${currentDetailsPage}&limit=${detailsPerPage}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.data;

        if (data && data.entries) {
          setTotalDetailsPages(result.totalPages || 1);
          const updatedStatement = {
            ...selectedStatement,
            entries: data.entries.map((entry: any, index: number) => ({
              id: entry.reference || `entry-${index}`,
              date: entry.date,
              description: entry.description,
              bookingId: entry.reference,
              reference: entry.reference,
              debit: entry.rawDebit || 0,
              credit: entry.rawCredit || 0,
              runningBalance: entry.rawBalance || 0,
              rawDebit: entry.rawDebit || 0,
              rawCredit: entry.rawCredit || 0,
              rawBalance: entry.rawBalance || 0,
            })),
            openingBalance: data.summary?.openingBalance || 0,
            closingBalance: data.summary?.closingBalance || 0,
            totalDebits: data.summary?.totalDebits || 0,
            totalCredits: data.summary?.totalCredits || 0,
            currency: data.summary?.currency || "USD",
          };
          setSelectedStatement(updatedStatement);
        }
      } catch (error) {
        console.error("Error fetching statement details:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch statement details");
      } finally {
        setLoadingDetails(null);
      }
    };

    fetchDetailsPage();
  }, [currentDetailsPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAgency, statusFilter, balanceFilter, searchTerm, sortBy, sortOrder]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedAgency("all");
    setStatusFilter("all");
    setBalanceFilter("all");
    setSortBy("agencyName");
    setSortOrder("asc");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Toggle sort order
  const toggleSortOrder = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");

  // Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange, className = "", itemsPerPage = 6, totalItems = 0 }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    itemsPerPage?: number;
    totalItems?: number;
  }) => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className={`bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 ${className}`}>
        {/* Mobile pagination */}
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Desktop pagination */}
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing{' '}
              <span className="font-medium">{startItem}</span>
              {' '}to{' '}
              <span className="font-medium">{endItem}</span>
              {' '}of{' '}
              <span className="font-medium">{totalItems}</span>
              {' '}results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                      ...
                    </span>
                  )}
                </>
              )}

              {/* Previous button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                  disabled={page === '...'}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                      : page === '...'
                      ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {/* Next button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const totalOutstanding = statements.reduce(
    (sum, s) => sum + Math.min(s.closingBalance, 0),
    0
  );
  const totalCredit = statements.reduce(
    (sum, s) => sum + Math.max(s.closingBalance, 0),
    0
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Statement of Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Agency account statements and balance summaries
          </p>
        </div>
        <button
          onClick={exportAllStatementsToCSV}
          className="flex w-full sm:w-auto items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export All Statements</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Outstanding
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                ${Math.abs(totalOutstanding).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Credit
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                ${totalCredit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Agencies
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {statements.filter((s) => s.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Statements
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {statements.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search agencies, contacts, or emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
            />
        </div>
      </div>

      {/* Filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agency
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.agencyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              max={new Date().toISOString().slice(0, 7)}
              onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="warning">Warning</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Balance
              </label>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All Balances</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="zero">Zero</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <div className="flex space-x-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="agencyName">Agency Name</option>
                  <option value="closingBalance">Closing Balance</option>
                  <option value="totalDebits">Total Debits</option>
                  <option value="totalCredits">Total Credits</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {sortOrder === "asc" ? (
                    <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                clearAllFilters();
                setSelectedMonth(new Date().toISOString().slice(0, 7));
              }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              Clear Filters
            </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{filteredStatements.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{statements.length}</span> statements
            </div>
          </div>
        </div>
      </div>

      {/* Statements List */}
      <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStatements.map((statement) => (
          <div
            key={statement.agencyId}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {statement.agencyName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {statement.contactName} • {statement.email}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    statement.status
                  )}`}
                >
                  {getStatusIcon(statement.status)}
                  <span className="capitalize">{statement.status}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Opening Balance
                  </p>
                  <p
                    className={`text-base sm:text-lg font-semibold ${statement.openingBalance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                      }`}
                  >
                    {statement.currency}{" "}
                    {Math.abs(statement.openingBalance).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Closing Balance
                  </p>
                  <p
                    className={`text-base sm:text-lg font-semibold ${statement.closingBalance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                      }`}
                  >
                    {statement.currency}{" "}
                    {Math.abs(statement.closingBalance).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {statement.entries.length} transactions
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Credit Limit: {statement.currency}{" "}
                    {statement.creditLimit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleViewDetails(statement)}
                  disabled={loadingDetails === statement.agencyId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loadingDetails === statement.agencyId ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "View Details"
                  )}
                </button>
                <button
                  onClick={() => exportStatementToCSV(statement)}
                  className="sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-sm flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
        
        {/* Pagination for Statements List */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={statementsPerPage}
            totalItems={totalStatements}
            className="mt-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          />
        )}
      </div>

      {/* Statement Detail Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                    Statement: {selectedStatement.agencyName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Period:{" "}
                    {new Date(
                      selectedStatement.statementPeriod.from
                    ).toLocaleDateString()}{" "}
                    to{" "}
                    {new Date(
                      selectedStatement.statementPeriod.to
                    ).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStatement(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-4 sm:p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-0">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">Reference</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Credit</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Balance</th>
                  </tr>
                </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Opening Balance */}
                      <tr className="bg-blue-50 dark:bg-blue-900/20">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(selectedStatement.statementPeriod.from).toLocaleDateString()}
                    </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      Opening Balance
                    </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                          {selectedStatement.currency} {selectedStatement.openingBalance.toFixed(2)}
                    </td>
                  </tr>

                  {/* Transaction Entries */}
                      {selectedStatement.entries.map((entry, index) => (
                        <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'} hover:bg-gray-100 dark:hover:bg-gray-600/50`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {entry.date}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white min-w-0" title={entry.description}>
                            <div className="truncate max-w-xs">
                              {entry.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {entry.reference}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {entry.debit > 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {selectedStatement.currency} {entry.debit.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {entry.credit > 0 ? (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                {selectedStatement.currency} {entry.credit.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${entry.runningBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {selectedStatement.currency} {Math.abs(entry.runningBalance).toFixed(2)}
                          </td>
                    </tr>
                  ))}

                  {/* Closing Balance */}
                      <tr className="bg-gray-100 dark:bg-gray-700 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(selectedStatement.statementPeriod.to).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          Closing Balance
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">-</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {selectedStatement.totalDebits > 0 ? (
                            <span className="text-red-600 dark:text-red-400">
                              {selectedStatement.currency} {selectedStatement.totalDebits.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {selectedStatement.totalCredits > 0 ? (
                            <span className="text-green-600 dark:text-green-400">
                              {selectedStatement.currency} {selectedStatement.totalCredits.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right ${selectedStatement.closingBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {selectedStatement.currency} {Math.abs(selectedStatement.closingBalance).toFixed(2)}
                        </td>
                  </tr>
                </tbody>
              </table>
                </div>
                
                {/* Pagination for Statement Details */}
                <Pagination
                  currentPage={currentDetailsPage}
                  totalPages={totalDetailsPages}
                  onPageChange={handleDetailsPageChange}
                  itemsPerPage={detailsPerPage}
                  totalItems={selectedStatement?.entries.length || 0}
                  className="border-t border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => exportStatementToCSV(selectedStatement)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Statement</span>
              </button>
              <button
                onClick={() => setSelectedStatement(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredStatements.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No statements found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatementOfAccount;