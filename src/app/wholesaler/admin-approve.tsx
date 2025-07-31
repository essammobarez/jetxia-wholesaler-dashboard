'use client';

import { NextPage } from "next";
import { useState, useMemo, useEffect, useCallback } from "react";
import { FiSearch, FiFileText, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";
import { debounce } from "lodash";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import DetailModal, { Registration as ImportedRegistration } from "./DetailModal";
import ConfirmModal from "./ConfirmModal";
import AssignMarkupModal from "./AssignMarkupModal";

// Define the structure of a markup plan object for type consistency
type MarkupPlanInfo = {
  _id: string;
  name: string;
  value?: number; // Value is optional as it might not be present everywhere
};

// Extend the imported Registration type to include all necessary fields for the main page
type Registration = ImportedRegistration & {
  // All fields are now in the imported Registration type from DetailModal
  // This ensures consistency.
  markupPlan?: MarkupPlanInfo; // Specify the shape of the markup plan
};


const AdminApprove: NextPage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalItem, setModalItem] = useState<Registration | null>(null);

  // State for the delete confirmation modal
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[];
    message: string;
  } | null>(null);

  // State for the new assign markup modal
  const [assignMarkupInfo, setAssignMarkupInfo] = useState<{
    ids: string[];
  } | null>(null);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to get token & wholesalerId
  const getAuthToken = useCallback(() => {
    if (typeof window !== "undefined") {
      // The user provided a token snippet, but this component already handles it.
      // We will use the existing consistent method.
      const tokenFromCookie = document.cookie
        .split("; ")
        .find((r) => r.startsWith("authToken="))
        ?.split("=")[1];
      return tokenFromCookie || localStorage.getItem("authToken") || "";
    }
    return "";
  }, []);


  const getWholesalerId = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("wholesalerId") || "";
    }
    return "";
  }, []);

  // Fetch agencies by wholesalerId, wrapped in useCallback to be stable
  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();
    const wholesalerId = getWholesalerId();
    if (!token) {
      toast.error("Auth token missing. Please login again.");
      setLoading(false);
      return;
    }
    if (!wholesalerId) {
      toast.error("Wholesaler ID missing.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}agency/wholesaler/${wholesalerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: Registration[] = json.data.map((item: any) => ({
          id: item._id,
          agencyName: item.agencyName,
          contactName: `${item.firstName} ${item.lastName}`,
          email: item.emailId || item.email,
          submittedAt: item.createdAt,
          status: item.status as "pending" | "approved" | "suspended",
          slug: item.slug,
          country: item.country,
          city: item.city,
          postCode: item.postCode,
          address: item.address,
          website: item.website,
          phoneNumber: item.phoneNumber,
          agencyEmail: item.email,
          businessCurrency: item.businessCurrency,
          vat: item.vat,
          licenseUrl: item.licenseUrl,
          title: item.title,
          firstName: item.firstName,
          lastName: item.lastName,
          designation: item.designation,
          mobileNumber: item.mobileNumber,
          markupPlan: item.markupPlan,
        }));
        setRegistrations(mapped);
      } else {
        toast.error(json.message || "Failed to load agencies");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching agencies");
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, getWholesalerId]);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);


  // Filter + sort
  const filtered = useMemo(() => {
    return registrations
      .filter(r =>
        r.agencyName.toLowerCase().includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime()
      );
  }, [registrations, search]);

  // Partition into Pending & Approved
  const pendingList = filtered.filter(r => r.status === "pending");
  const approvedList = filtered.filter(r => r.status === "approved");

  // Pagination slices
  const pendingPages = Math.ceil(pendingList.length / itemsPerPage) || 1;
  const approvedPages = Math.ceil(approvedList.length / itemsPerPage) || 1;
  const pendingSlice = pendingList.slice(
    (pendingPage - 1) * itemsPerPage,
    pendingPage * itemsPerPage
  );
  const approvedSlice = approvedList.slice(
    (approvedPage - 1) * itemsPerPage,
    approvedPage * itemsPerPage
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((val: string) => setSearch(val), 300),
    []
  );
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
    setPendingPage(1);
    setApprovedPage(1);
  };

  // Selection helpers
  const toggleSelect = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = (list: Registration[]) => {
    setSelected(prev => {
      const next = new Set(prev);
      const allIds = list.map(r => r.id);
      const allSelected = allIds.every(id => next.has(id));
      allIds.forEach(id =>
        allSelected ? next.delete(id) : next.add(id)
      );
      return next;
    });
  };

  // Request handlers for modals
  const requestAction = (action: "approve" | "delete", ids: string[]) => {
    if (ids.length === 0) return;

    if (action === "approve") {
      setAssignMarkupInfo({ ids });
    } else {
      setPendingDelete({ ids, message: `Delete ${ids.length} item(s)?` });
    }
  };

  // Perform deletion
  const doDelete = async () => {
    if (!pendingDelete) return;
    const { ids } = pendingDelete;
    // NOTE: This assumes client-side deletion for now.
    // Replace with actual DELETE API call if available.
    setRegistrations(prev => prev.filter(r => !ids.includes(r.id)));
    toast.success(`Deleted ${ids.length} item(s)!`);
    setSelected(new Set());
    setPendingDelete(null);
  };

  // Perform markup assignment and approval
  const handleAssignAndApprove = async (planId: string) => {
    if (!assignMarkupInfo) return;
    const { ids } = assignMarkupInfo;
    const token = getAuthToken();
    if (!token) {
        toast.error("Authorization failed. Please log in again.");
        return;
    }

    toast.info(`Assigning and approving ${ids.length} agencies...`);

    try {
      // Step 1: Assign markup plan to all selected agencies
      const assignPromises = ids.map(agencyId =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}markup/${planId}/assign/${agencyId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            if(!res.ok) throw new Error(`Failed to assign plan to agency ${agencyId}`);
            return res.json();
        })
      );
      await Promise.all(assignPromises);

      // Step 2: Approve all selected agencies using the new endpoint
      const approvePromises = ids.map(agencyId =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}wholesaler/${agencyId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "approved" }),
        }).then(res => {
            if(!res.ok) throw new Error(`Failed to approve agency ${agencyId}`);
            return res.json();
        })
      );
      await Promise.all(approvePromises);

      toast.success(`Successfully assigned and approved ${ids.length} item(s)!`);
      
      // Step 3: Refetch all data to get the latest state including new markup plans
      await fetchAgencies();

    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "An error occurred during the process.");
    } finally {
      setSelected(new Set());
      setAssignMarkupInfo(null);
    }
  };


  // Export PDF
  const exportPDF = () => {
    const rows = selected.size
      ? registrations.filter(r => selected.has(r.id))
      : filtered;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFontSize(16);
    doc.text("Registrations Report", 40, 50);

    const headers = [["ID", "Agency", "Contact", "Email", "Submitted At", "Status", "Markup"]];
    const data = rows.map(r => [
      r.id,
      r.agencyName,
      r.contactName,
      r.email,
      format(new Date(r.submittedAt), "MMM dd, hh:mm a"),
      r.status.toUpperCase(),
      r.markupPlan?.name || "N/A"
    ]);
    autoTable(doc, {
      startY: 70,
      head: headers,
      body: data,
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 40, right: 40 },
    });
    doc.save("registrations.pdf");
    toast.info("PDF download started");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading agencies…
      </div>
    );
  }

  // Section renderer with pagination controls
  const renderSection = (
    title: string,
    list: Registration[],
    slice: Registration[],
    currentPage: number,
    totalPages: number,
    setPage: (n: number) => void
  ) => (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title} ({list.length})</h2>
        <input
          type="checkbox"
          className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
          checked={list.length > 0 && list.every(r => selected.has(r.id))}
          onChange={() => toggleAll(list)}
        />
      </div>
      {/* The container below is no longer a simple div. For mobile, it's just a container.
        For desktop, it's a table with a shadow and rounded corners.
        This is why the `bg-white rounded-2xl shadow-lg` are prefixed with `md:`
      */}
      <div className="md:bg-white md:rounded-2xl md:shadow-lg">
        <table className="min-w-full">
            <thead className="hidden md:table-header-group md:bg-gray-100">
                <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Select</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Agency</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    {title === "Approved Registrations" && <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Markup</th>}
                    <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-transparent">
                {slice.map(r => (
                    // --- RESPONSIVE CHANGE: Row is now a visually distinct card on mobile ---
                    <tr key={r.id} className="block bg-white p-4 rounded-lg shadow-md border mb-4 md:table-row md:p-0 md:bg-transparent md:shadow-none md:border-none md:mb-0">
                        <td data-label="Select" className="block md:table-cell py-2 md:px-6 md:py-4 text-right md:text-left border-b md:border-none last:border-none before:content-[attr(data-label)] before:font-bold before:float-left md:before:content-none">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                                checked={selected.has(r.id)}
                                onChange={() => toggleSelect(r.id)}
                            />
                        </td>
                        <td data-label="Agency" className="block md:table-cell py-2 md:px-6 md:py-4 text-right md:text-left border-b md:border-none last:border-none before:content-[attr(data-label)] before:font-bold before:float-left md:before:content-none font-medium text-gray-900">{r.agencyName}</td>
                        <td data-label="Contact" className="block md:table-cell py-2 md:px-6 md:py-4 text-right md:text-left border-b md:border-none last:border-none before:content-[attr(data-label)] before:font-bold before:float-left md:before:content-none">{r.contactName}</td>
                        <td data-label="Email" className="block md:table-cell py-2 md:px-6 md:py-4 text-right md:text-left border-b md:border-none last:border-none before:content-[attr(data-label)] before:font-bold before:float-left md:before:content-none">{r.email}</td>
                        <td data-label="Status" className="block md:table-cell py-2 md:px-6 md:py-4 text-right md:text-left border-b md:border-none last:border-none before:content-[attr(data-label)] before:font-bold before:float-left md:before:content-none">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${r.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            </span>
                        </td>
                        {title === "Approved Registrations" && (
                            <td data-label="Markup" className="block md:table-cell py-2 md:px-6 md:py-4 text-right md:text-left border-b md:border-none last:border-none before:content-[attr(data-label)] before:font-bold before:float-left md:before:content-none">
                                {r.markupPlan?.name || 'N/A'}
                            </td>
                        )}
                        <td data-label="Actions" className="block md:table-cell py-2 md:px-6 md:py-4 text-right md:text-left before:content-[attr(data-label)] before:font-bold before:float-left md:before:content-none">
                            <div className="flex items-center justify-end md:justify-start space-x-3">
                                <button onClick={() => setModalItem(r)} title="View" className="p-1 hover:bg-gray-100 rounded">
                                    <FiFileText size={20} className="text-indigo-600" />
                                </button>
                                {r.status === "pending" && (
                                    <button onClick={() => requestAction("approve", [r.id])} title="Approve" className="p-1 hover:bg-gray-100 rounded">
                                        <FiCheckCircle size={20} className="text-green-600" />
                                    </button>
                                )}
                                <button onClick={() => requestAction("delete", [r.id])} title="Delete" className="p-1 hover:bg-gray-100 rounded">
                                    <FiTrash2 size={20} className="text-red-600" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      {/* pagination */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 sm:mb-0">
          Agency Approvals
        </h1>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search agencies..."
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={exportPDF}
            className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition"
          >
            <FiFileText className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6 justify-end">
        <button
          onClick={() => requestAction("approve", Array.from(selected))}
          disabled={!selected.size}
          className="flex items-center px-4 py-2 bg-green-500 disabled:opacity-50 text-white rounded-lg hover:bg-green-600 transition"
        >
          <FiCheckCircle className="mr-2" /> Approve Selected
        </button>
        <button
          onClick={() => requestAction("delete", Array.from(selected))}
          disabled={!selected.size}
          className="flex items-center px-4 py-2 bg-red-500 disabled:opacity-50 text-white rounded-lg hover:bg-red-600 transition"
        >
          <FiTrash2 className="mr-2" /> Delete Selected
        </button>
      </div>

      {/* Sections with Pagination */}
      {renderSection(
        "Pending Registrations",
        pendingList,
        pendingSlice,
        pendingPage,
        pendingPages,
        setPendingPage
      )}
      {renderSection(
        "Approved Registrations",
        approvedList,
        approvedSlice,
        approvedPage,
        approvedPages,
        setApprovedPage
      )}

      {/* Modals */}
      {modalItem && (
        <DetailModal item={modalItem} onClose={() => setModalItem(null)} />
      )}
      {pendingDelete && (
        <ConfirmModal
          message={pendingDelete.message}
          onConfirm={doDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      {assignMarkupInfo && (
        <AssignMarkupModal
          agencyCount={assignMarkupInfo.ids.length}
          onConfirm={handleAssignAndApprove}
          onCancel={() => setAssignMarkupInfo(null)}
          wholesalerId={getWholesalerId()}
          authToken={getAuthToken()}
        />
      )}
    </div>
  );
};

export default AdminApprove;