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
import DetailModal, { Registration } from "./DetailModal";
import ConfirmModal from "./ConfirmModal";

const AdminApprove: NextPage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalItem, setModalItem] = useState<Registration | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    action: "approve" | "delete";
    ids: string[];
    message: string;
  } | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all agencies
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
const res = await fetch(`${process.env.API_URL}agency/agency`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: Registration[] = json.data.map((item: any) => ({
            id: item._id,
            agencyName: item.agencyName,
            contactName: `${item.firstName} ${item.lastName}`,
            email: item.emailId || item.email,
            submittedAt: item.createdAt,
            status: item.status as "pending" | "approved" | "suspended",
          }));
          setRegistrations(mapped);
        } else {
          toast.error("Failed to load agencies");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching agencies");
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

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

  // Confirm dialog
  const requestConfirm = (action: "approve" | "delete", ids: string[]) => {
    const verb = action === "approve" ? "Approve" : "Delete";
    setPendingAction({ action, ids, message: `${verb} ${ids.length} item(s)?` });
  };

  // Perform action
  const doAction = async () => {
    if (!pendingAction) return;
    const { action, ids } = pendingAction;
    if (action === "approve") {
      await Promise.all(ids.map(id =>
        fetch(`https://api.jetixia.com/api/v1/agency/admin/agencies/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        })
      ));
      setRegistrations(prev =>
        prev.map(r =>
          ids.includes(r.id) ? { ...r, status: "approved" } : r
        )
      );
      toast.success(`Approved ${ids.length} item(s)!`);
    } else {
      setRegistrations(prev => prev.filter(r => !ids.includes(r.id)));
      toast.success(`Deleted ${ids.length} item(s)!`);
    }
    setSelected(new Set());
    setPendingAction(null);
  };

  // Export PDF
  const exportPDF = () => {
    const rows = selected.size
      ? registrations.filter(r => selected.has(r.id))
      : filtered;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFontSize(16);
    doc.text("Registrations Report", 40, 50);

    const headers = [["ID", "Agency", "Contact", "Email", "Submitted At", "Status"]];
    const data = rows.map(r => [
      r.id,
      r.agencyName,
      r.contactName,
      r.email,
      format(new Date(r.submittedAt), "MMM dd, yyyy • hh:mm a"),
      r.status.toUpperCase(),
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
          checked={list.length > 0 && list.every(r => selected.has(r.id))}
          onChange={() => toggleAll(list)}
        />
      </div>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3">Select</th>
              <th className="px-6 py-3">Agency</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Submitted</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {slice.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleSelect(r.id)}
                  />
                </td>
                <td className="px-6 py-4 font-medium">{r.agencyName}</td>
                <td className="px-6 py-4">{r.contactName}</td>
                <td className="px-6 py-4">{r.email}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {format(new Date(r.submittedAt), "MMM dd, yyyy • hh:mm a")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      `px-2 py-1 text-xs font-medium rounded-full ` +
                      (r.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800")
                    }
                  >
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button
                    onClick={() => setModalItem(r)}
                    title="View"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FiFileText size={20} className="text-indigo-600" />
                  </button>
                  {r.status === "pending" && (
                    <button
                      onClick={() => requestConfirm("approve", [r.id])}
                      title="Approve"
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <FiCheckCircle size={20} className="text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => requestConfirm("delete", [r.id])}
                    title="Delete"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FiTrash2 size={20} className="text-red-600" />
                  </button>
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
            className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white rounded-xl shadow-lg"
          >
            <FiFileText className="mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6 justify-end">
        <button
          onClick={() => requestConfirm("approve", Array.from(selected))}
          disabled={!selected.size}
          className="flex items-center px-4 py-2 bg-green-500 disabled:opacity-50 text-white rounded-lg"
        >
          <FiCheckCircle className="mr-2" /> Approve Selected
        </button>
        <button
          onClick={() => requestConfirm("delete", Array.from(selected))}
          disabled={!selected.size}
          className="flex items-center px-4 py-2 bg-red-500 disabled:opacity-50 text-white rounded-lg"
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
      {pendingAction && (
        <ConfirmModal
          message={pendingAction.message}
          onConfirm={doAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
};

export default AdminApprove;