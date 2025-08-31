'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FaTrashAlt, FaDownload, FaTable, FaFile, FaTimesCircle, FaEdit } from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import * as XLSX from 'xlsx';

// MUI Imports
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  borderRadius: '8px',
};

const AddRecipients = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [emails, setEmails] = useState(['']);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState({});
  const [listName, setListName] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditRow, setCurrentEditRow] = useState(null);
  const [savedLists, setSavedLists] = useState([]);

  useEffect(() => {
    const storedLists = localStorage.getItem('savedRecipientLists');
    if (storedLists) {
      setSavedLists(JSON.parse(storedLists));
    }
  }, []);

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleRemoveEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const downloadSampleFile = () => {
    const data = [
      ['Email', 'First Name', 'Last Name', 'Phone', 'Address'],
      ['john.doe@example.com', 'John', 'Doe', '123-456-7890', '123 Main St'],
      ['jane.smith@example.com', 'Jane', 'Smith', '098-765-4321', '456 Oak Ave'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Recipients');
    XLSX.writeFile(wb, 'sample_recipients.xlsx');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      setShowTable(false);
      setSelectedEmails({});
      setListName('');
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length > 1) {
          const headers = json[0];
          const rows = json.slice(1);
          const formattedData = rows.map(row => {
            const rowObject = {};
            headers.forEach((header, index) => {
              rowObject[header] = row[index];
            });
            return rowObject;
          });
          setTableData(formattedData);
        } else {
          setTableData([]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setTableData([]);
    setShowTable(false);
    setSelectedEmails({});
    setListName('');
  };

  const handleViewAndSave = () => {
    setShowTable(true);
  };

  const handleCheckboxChange = (email) => {
    setSelectedEmails(prevState => ({
      ...prevState,
      [email]: !prevState[email],
    }));
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const allEmails = tableData.reduce((acc, row) => {
        if (row.Email) {
          acc[row.Email] = true;
        }
        return acc;
      }, {});
      setSelectedEmails(allEmails);
    } else {
      setSelectedEmails({});
    }
  };
  
  const handleEditRow = (row) => {
    setCurrentEditRow(row);
    setEditModalOpen(true);
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEditRow(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveEdit = () => {
    const updatedTableData = tableData.map(row => 
      row.Email === currentEditRow.Email ? currentEditRow : row
    );
    setTableData(updatedTableData);
    setEditModalOpen(false);
  };

  const handleDeleteRow = (email) => {
    const updatedTableData = tableData.filter(row => row.Email !== email);
    setTableData(updatedTableData);
    const newSelectedEmails = { ...selectedEmails };
    delete newSelectedEmails[email];
    setSelectedEmails(newSelectedEmails);
  };

  const handleSaveList = () => {
    const selectedEmailsList = tableData.filter((row) => selectedEmails[row.Email]);
    if (selectedEmailsList.length > 0 && listName) {
      const newList = {
        name: listName,
        data: selectedEmailsList,
      };
      const updatedSavedLists = [...savedLists, newList];
      setSavedLists(updatedSavedLists);
      localStorage.setItem('savedRecipientLists', JSON.stringify(updatedSavedLists));
      alert(`Successfully saved ${selectedEmailsList.length} emails to list "${listName}"!`);
      setListName('');
      setSelectedEmails({});
      setUploadedFileName(null);
      setShowTable(false);
      setActiveTab('saved');
    } else {
      alert('Please select at least one email and provide a list name.');
    }
  };

  const handleSelectSavedList = (list) => {
    setListName(list.name);
    setTableData(list.data);
    const initialSelected = list.data.reduce((acc, row) => {
        acc[row.Email] = true;
        return acc;
    }, {});
    setSelectedEmails(initialSelected);
    setActiveTab('upload');
    setShowTable(true);
    setUploadedFileName(`[Saved] ${list.name}`);
  };

  const handleDeleteSavedList = (listName) => {
      const updatedSavedLists = savedLists.filter(list => list.name !== listName);
      setSavedLists(updatedSavedLists);
      localStorage.setItem('savedRecipientLists', JSON.stringify(updatedSavedLists));
  };


  const selectedCount = useMemo(() => Object.values(selectedEmails).filter(Boolean).length, [selectedEmails]);
  const isAllSelected = selectedCount > 0 && selectedCount === tableData.length;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full">
        <div className="flex border-b border-gray-200">
          <div
            className={`py-2 px-4 cursor-pointer ${
              activeTab === 'manual'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('manual');
              setUploadedFileName(null);
              setShowTable(false);
              setSelectedEmails({});
              setListName('');
            }}
          >
            Manual Entry
          </div>
          <div
            className={`py-2 px-4 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('upload');
            }}
          >
            Upload File
          </div>
          <div
            className={`py-2 px-4 cursor-pointer ${
              activeTab === 'saved'
                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('saved');
              setUploadedFileName(null);
              setShowTable(false);
              setSelectedEmails({});
              setListName('');
            }}
          >
            Saved Lists
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Recipients
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'manual'
              ? 'Manually enter email addresses below.'
              : activeTab === 'upload'
              ? 'Upload a CSV, XLSX, or plain text file with email addresses.'
              : 'Select a previously saved list.'}
          </p>

          {activeTab === 'saved' && (
            <div className="mt-4">
              <List>
                {savedLists.length > 0 ? (
                  savedLists.map((list, index) => (
                    <ListItem
                      key={index}
                      disablePadding
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSavedList(list.name)}>
                          <FaTrashAlt />
                        </IconButton>
                      }
                    >
                      <ListItemButton onClick={() => handleSelectSavedList(list)}>
                        <ListItemText primary={list.name} secondary={`${list.data.length} recipients`} />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                    No saved lists found.
                  </Typography>
                )}
              </List>
            </div>
          )}

          {showTable && tableData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Recipients <span className="text-sm font-normal text-gray-500">({selectedCount} of {tableData.length} selected)</span></h3>
              <div className="border border-gray-200 rounded-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={isAllSelected}
                          className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        />
                      </th>
                      {Object.keys(tableData[0]).map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={!!selectedEmails[row.Email]}
                            onChange={() => handleCheckboxChange(row.Email)}
                            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                          />
                        </td>
                        {Object.values(row).map((value, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {value}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => handleEditRow(row)} className="text-blue-600 hover:text-blue-900 mr-2">
                            <FaEdit size={16} />
                          </button>
                          <button onClick={() => handleDeleteRow(row.Email)} className="text-red-600 hover:text-red-900">
                            <FaTrashAlt size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col md:flex-row items-center justify-end space-y-4 md:space-y-0 md:space-x-4">
                <input
                  type="text"
                  placeholder="Enter list name"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full md:w-auto flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <button
                  onClick={handleSaveList}
                  className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-700 transition-colors shadow-md w-full md:w-auto"
                >
                  Save List
                </button>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Recipients</h3>
              <div className="space-y-4">
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      onClick={() => handleRemoveEmail(index)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      <FaTrashAlt size={20} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddEmail}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4"
                >
                  <IoAdd size={20} className="mr-1" />
                  Add More
                </button>
              </div>
            </div>
          )}

          {activeTab === 'upload' && !showTable && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-center text-gray-500 h-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8"
                    />
                  </svg>
                  <p className="mt-2">Drag and drop your file here</p>
                  <p className="mt-1 text-sm text-gray-400">or</p>
                  <label
                    htmlFor="file-upload"
                    className="mt-2 text-blue-600 font-semibold cursor-pointer hover:text-blue-700"
                  >
                    Browse to upload
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".csv, .xlsx, .txt" />
                  </label>
                  <p className="mt-2 text-xs text-gray-400">
                    Supported formats: CSV, XLSX, TXT
                  </p>
                  {uploadedFileName && (
                    <div className="mt-4 flex flex-col items-center">
                      <div className="flex items-center text-gray-800 font-medium">
                        <FaFile className="mr-2" />
                        <span>{uploadedFileName}</span>
                        <button onClick={handleRemoveFile} className="ml-2 text-red-500 hover:text-red-700">
                          <FaTimesCircle />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full justify-between">
                <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700 h-full">
                  <p className="font-semibold">Important Information:</p>
                  <p className="text-sm mt-1">
                    Your file must include a header row with the following column names (case-sensitive):
                    <span className="font-mono text-blue-600 ml-2">Email, First Name, Last Name, Phone, Address</span>.
                    The **Email** column is required.
                  </p>
                  <div className="mt-4 text-center">
                    <button
                      onClick={downloadSampleFile}
                      className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
                    >
                      <FaDownload className="mr-2" />
                      Download Sample File
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          {activeTab === 'upload' && !showTable && (
            <button
              onClick={handleViewAndSave}
              disabled={!uploadedFileName}
              className={`font-semibold py-2 px-6 rounded-md transition-colors shadow-md ${
                !uploadedFileName
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              View and Save →
            </button>
          )}
        </div>
      </div>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Edit Recipient
          </Typography>
          {currentEditRow && (
            <>
              {Object.keys(currentEditRow).map((key) => (
                <TextField
                  key={key}
                  label={key}
                  name={key}
                  value={currentEditRow[key] || ''}
                  onChange={handleEditChange}
                  fullWidth
                  margin="normal"
                />
              ))}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveEdit}>
                  Save
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default AddRecipients;