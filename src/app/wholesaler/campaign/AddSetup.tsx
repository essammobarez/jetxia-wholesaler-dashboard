import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import TextField from '@mui/material/TextField';
import { IoArrowBack } from 'react-icons/io5';

// Define Subscriber type to match the parent
type Subscriber = {
  _id: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  status: string;
};

interface AddSetupProps {
  data: Subscriber[];
  onProceed: (finalData: Subscriber[]) => void;
  onBack: () => void;
}

const AddSetup: React.FC<AddSetupProps> = ({ data, onProceed, onBack }) => {
  const [tableData, setTableData] = useState(data);
  const [selectedRows, setSelectedRows] = useState(new Set<number>());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<{ index: number; data: Subscriber } | null>(null);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const headers = ['Email', 'Name', 'Phone', 'Country', 'Status'];
  const rows = tableData || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allRowIndices = new Set(rows.map((_, index) => index));
      setSelectedRows(allRowIndices);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowIndex: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowIndex)) {
      newSelection.delete(rowIndex);
    } else {
      newSelection.add(rowIndex);
    }
    setSelectedRows(newSelection);
  };

  const handleOpenEditModal = (rowIndex: number) => {
    setEditingRow({
      index: rowIndex,
      data: { ...rows[rowIndex] }, // Create a copy to edit
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
  };

  const handleModalDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Omit<Subscriber, '_id'>) => {
    if (editingRow) {
      const updatedData = { ...editingRow.data, [field]: e.target.value };
      setEditingRow({ ...editingRow, data: updatedData });
    }
  };

  const handleSaveChanges = () => {
    if (editingRow) {
      const newData = [...tableData];
      newData[editingRow.index] = editingRow.data;
      setTableData(newData);
      handleCloseModal();
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.size} selected items?`)) {
      const newTableData = rows.filter((_, index) => !selectedRows.has(index));
      setTableData(newTableData);
      setSelectedRows(new Set());
    }
  };

  const handleProceed = () => {
    if (selectedRows.size > 0) {
      const selectedData = rows.filter((_, index) => selectedRows.has(index));
      onProceed(selectedData);
    } else {
      onProceed(tableData);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full items-center bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Review Recipient Data</h2>
          {rows.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200/70 overflow-hidden">
              <div className="p-4 border-b border-gray-200/80 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-base font-semibold text-gray-700">{rows.length} Total Recipients</h3>
                {selectedRows.size > 0 && (
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-blue-600">{selectedRows.size} selected</p>
                    <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors" aria-label="Delete selected rows">
                      <FaTrashAlt /> Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="overflow-auto max-h-[65vh]">
                <table className="min-w-full divide-y divide-gray-200/80">
                  <thead className="bg-slate-100 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 text-center">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/50" onChange={handleSelectAll} checked={selectedRows.size === rows.length && rows.length > 0} aria-label="Select all rows" />
                      </th>
                      {headers.map((header, index) => (
                        <th key={index} scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
                      ))}
                      <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200/80">
                    {rows.map((row, rowIndex) => (
                      <tr key={row._id} className={`transition-colors duration-150 ${selectedRows.has(rowIndex) ? 'bg-blue-100' : 'odd:bg-white even:bg-slate-50'} hover:bg-blue-50/70`}>
                        <td className="px-6 py-4 text-center">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/50" checked={selectedRows.has(rowIndex)} onChange={() => handleSelectRow(rowIndex)} aria-label={`Select row ${rowIndex + 1}`} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button onClick={() => handleOpenEditModal(rowIndex)} className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded-full hover:bg-blue-100" aria-label={`Edit row ${rowIndex + 1}`}>
                            <FaEdit className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200/80 flex flex-col items-center">
              <FaExclamationTriangle className="text-yellow-400 text-5xl mb-4" />
              <p className="text-xl font-semibold text-gray-700">No Data to Display</p>
              <p className="text-gray-500 mt-2">There are no subscribers in the selected list.</p>
            </div>
          )}
        </div>
        <div className="w-full mt-8 flex justify-between items-center max-w-7xl">
          <button onClick={onBack} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-full transition-colors duration-200 border border-gray-300 flex items-center gap-2">
            <IoArrowBack /> Go Back
          </button>
          <button onClick={handleProceed} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed" disabled={rows.length === 0}>
            Continue to Add Content
          </button>
        </div>
      </div>
      {isModalOpen && editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg m-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3"><FaEdit className="text-blue-500" /> Edit Row #{editingRow.index + 1}</h3>
            </div>
            <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <TextField fullWidth variant="outlined" label="Email" value={editingRow.data.email} onChange={(e) => handleModalDataChange(e, 'email')} />
              <TextField fullWidth variant="outlined" label="Name" value={editingRow.data.name} onChange={(e) => handleModalDataChange(e, 'name')} />
              <TextField fullWidth variant="outlined" label="Phone" value={editingRow.data.phone} onChange={(e) => handleModalDataChange(e, 'phone')} />
              <TextField fullWidth variant="outlined" label="Country" value={editingRow.data.country} onChange={(e) => handleModalDataChange(e, 'country')} />
              <TextField fullWidth variant="outlined" label="Status" value={editingRow.data.status} onChange={(e) => handleModalDataChange(e, 'status')} />
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button type="button" onClick={handleCloseModal} className="bg-white py-2 px-5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors">Cancel</button>
              <button type="button" onClick={handleSaveChanges} className="bg-blue-600 py-2 px-5 border border-transparent rounded-lg font-semibold text-white hover:bg-blue-700 focus:outline-none transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddSetup;