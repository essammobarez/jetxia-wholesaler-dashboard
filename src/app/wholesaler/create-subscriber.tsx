'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaTrashAlt, FaDownload, FaFile, FaTimesCircle, FaEdit } from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

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
import CircularProgress from '@mui/material/CircularProgress';

// --- Modal Styles ---
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

const subscribersModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '1000px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    maxHeight: '90vh',
    overflowY: 'auto',
};


// --- Helper Functions ---
const getAuthToken = () => {
  // Replace with your actual token retrieval logic (e.g., from localStorage, cookies)
  return localStorage.getItem('authToken');
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Ensure this is set in your .env file
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


const AddRecipients = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [emails, setEmails] = useState(['']); // State for manual entry
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState({});

  // State for new list modal
  const [isListDetailModalOpen, setIsListDetailModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  // API-driven state
  const [savedLists, setSavedLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit row modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditRow, setCurrentEditRow] = useState(null);

  // --- New State for Saved List Subscribers Modal ---
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [subscribersForModal, setSubscribersForModal] = useState([]);
  const [selectedListTitle, setSelectedListTitle] = useState('');


  // --- Manual Entry Handlers ---
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

  // Fetch saved lists from API
  const loadLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/campaign/subscribers/lists');
      setSavedLists(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
      toast.error("Failed to fetch saved lists.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadLists();
    }
  }, [activeTab, loadLists]);

  const downloadSampleFile = () => {
    const data = [
      ['email', 'name', 'phone', 'country', 'status', 'tags'],
      ['john.doe@example.com', 'John Doe', '+15551234567', 'US', 'subscribed', 'VIP,Early Adopter'],
      ['jane.smith@example.com', 'Jane Smith', '+442071234567', 'GB', 'subscribed', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample_Recipients');
    XLSX.writeFile(wb, 'sample_recipients.xlsx');
  };

  // --- MODIFIED: This function is now more robust for handling file uploads ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setUploadedFileName(file.name);
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            // FIX: This mapping logic makes header detection flexible.
            const formattedData = json.map(row => {
                // Create a case-insensitive lookup for row keys.
                const rowKeys = Object.keys(row);
                const findKey = (key) => rowKeys.find(k => k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, ''));

                const emailKey = findKey('Email');
                const phoneKey = findKey('Phone');
                const firstNameKey = findKey('FirstName') || findKey('First Name');
                const lastNameKey = findKey('LastName') || findKey('Last Name');
                const countryKey = findKey('Country');
                const statusKey = findKey('Status');
                const tagsKey = findKey('Tags');

                // FIX: Combine First and Last Name into a single 'name' field.
                const firstName = firstNameKey ? row[firstNameKey] : '';
                const lastName = lastNameKey ? row[lastNameKey] : '';
                const fullName = `${firstName} ${lastName}`.trim();

                return {
                    email: emailKey ? row[emailKey] : '',
                    name: fullName,
                    phone: phoneKey ? row[phoneKey] : '',
                    country: countryKey ? row[countryKey] : '',
                    // FIX: Provide default values for optional columns.
                    status: statusKey ? row[statusKey] : 'subscribed',
                    tags: tagsKey ? row[tagsKey] : '',
                };
            }).filter(row => row.email); // Ensure only rows with an email are kept.

            if (formattedData.length === 0) {
              toast.error("Could not find any valid subscriber data. Please check the column headers in your file.");
              setTableData([]);
            } else {
              setTableData(formattedData);
            }
        };
        reader.readAsArrayBuffer(file);
        setShowTable(false);
    }
  };


  const clearUploadState = () => {
      setUploadedFileName(null);
      setTableData([]);
      setShowTable(false);
      setSelectedEmails({});
      setNewListTitle('');
      setNewListDescription('');
  };

  const handleRemoveFile = () => {
    clearUploadState();
  };

  const handleViewFile = () => {
    if (tableData.length > 0) {
      setShowTable(true);
      const allEmails = tableData.reduce((acc, row) => {
        if (row.email) acc[row.email] = true;
        return acc;
      }, {});
      setSelectedEmails(allEmails);
    } else {
        toast.error("The file seems to be empty or does not contain valid data. Please check your file and try again.");
    }
  };

  const handleCheckboxChange = (email) => {
    setSelectedEmails(prevState => ({
      ...prevState,
      [email]: !prevState[email],
    }));
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    if (checked) {
      const allEmails = tableData.reduce((acc, row) => {
        if (row.email) acc[row.email] = true;
        return acc;
      }, {});
      setSelectedEmails(allEmails);
    } else {
      setSelectedEmails({});
    }
  };
  
  const handleEditRow = (row) => {
    setCurrentEditRow({ ...row, originalEmail: row.email });
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
    setTableData(prevData =>
      prevData.map(row => (row.email === currentEditRow.originalEmail ? { ...currentEditRow } : row))
    );
    setEditModalOpen(false);
  };

  const handleDeleteRow = (email) => {
    setTableData(prevData => prevData.filter(row => row.email !== email));
    setSelectedEmails(prevSelected => {
      const newSelected = { ...prevSelected };
      delete newSelected[email];
      return newSelected;
    });
  };

  const handleConfirmSaveList = async () => {
      if (!newListTitle) {
          toast.error("List Title is required.");
          return;
      }

      let subscribersToImport = [];

      if (activeTab === 'upload') {
          subscribersToImport = tableData
            .filter(row => selectedEmails[row.email])
            .map(row => ({
                email: row.email,
                name: row.name || '',
                phone: row.phone || '',
                country: row.country || '',
                status: row.status || 'subscribed',
                tags: typeof row.tags === 'string' && row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
            }));
      } else if (activeTab === 'manual') {
          subscribersToImport = emails
            .map(email => email.trim())
            .filter(email => email !== '')
            .map(email => ({
                email: email,
                name: '', phone: '', country: '', status: 'subscribed', tags: []
            }));
      }

      if (subscribersToImport.length === 0) {
          toast.error("Please add at least one subscriber.");
          return;
      }
      
      setIsLoading(true);
      try {
          const listResponse = await apiClient.post('/campaign/subscribers/lists', {
              title: newListTitle,
              description: newListDescription,
          });

          const listId = listResponse.data.data._id;
          toast.success(`List "${newListTitle}" created successfully!`);

          await apiClient.post('/campaign/subscribers/import', {
              listId,
              subscribers: subscribersToImport,
          });

          toast.success(`${subscribersToImport.length} subscribers are being imported.`);
          
          setIsListDetailModalOpen(false);
          clearUploadState();
          setEmails(['']); // Reset manual input form
          setActiveTab('saved');

      } catch (error) {
          console.error("Failed to save list and import subscribers:", error);
          toast.error(error.response?.data?.message || "An error occurred.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSelectSavedList = async (list) => {
    setIsLoading(true);
    try {
        const response = await apiClient.get(`/campaign/subscribers`, { params: { listId: list._id } });
        
        if (response.data.success) {
            setSubscribersForModal(response.data.data || []);
            setSelectedListTitle(list.title);
            setIsSubscribersModalOpen(true);
        } else {
            toast.error(response.data.message || "Could not fetch subscribers.");
        }
    } catch (error) {
        console.error("Failed to fetch list details:", error);
        toast.error("Could not load the selected list.");
    } finally {
        setIsLoading(false);
    }
  };

  const selectedCount = useMemo(() => Object.values(selectedEmails).filter(Boolean).length, [selectedEmails]);
  const isAllSelected = tableData.length > 0 && selectedCount === tableData.length;
  const tableHeaders = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="container mx-auto p-6">
        <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-xl">
                <CircularProgress />
            </div>
        )}
        <div className="flex border-b border-gray-200">
          <div
            className={`py-2 px-4 cursor-pointer ${activeTab === 'manual' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('manual'); clearUploadState(); }}
          >
            Manual Entry
          </div>
          <div
            className={`py-2 px-4 cursor-pointer ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload File
          </div>
          <div
            className={`py-2 px-4 cursor-pointer ${activeTab === 'saved' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Lists
          </div>
        </div>

        <div className="mt-6">
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
                                  className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button onClick={() => handleRemoveEmail(index)} className="text-gray-400 hover:text-red-600 p-1">
                                  <FaTrashAlt size={16} />
                              </button>
                          </div>
                      ))}
                      <button onClick={handleAddEmail} className="flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4">
                          <IoAdd size={20} className="mr-1" />
                          Add More
                      </button>
                  </div>
                   <div className="mt-8 flex justify-end">
                      <button
                          onClick={() => setIsListDetailModalOpen(true)}
                          disabled={emails.every(e => e.trim() === '')}
                          className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                          Save List...
                      </button>
                  </div>
              </div>
            )}

            {activeTab === 'upload' && !showTable && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-center text-gray-500 h-full">
                     <FaFile className="h-12 w-12 text-gray-400" />
                    <p className="mt-2">Drag and drop your file here</p>
                    <p className="mt-1 text-sm text-gray-400">or</p>
                    <label htmlFor="file-upload" className="mt-2 text-blue-600 font-semibold cursor-pointer hover:text-blue-700">
                      Browse to upload
                      <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".csv, .xlsx" />
                    </label>
                    <p className="mt-2 text-xs text-gray-400">Supported formats: CSV, XLSX</p>
                    {uploadedFileName && (
                      <div className="mt-4 flex flex-col items-center">
                        <div className="flex items-center text-gray-800 font-medium">
                          <FaFile className="mr-2" />
                          <span>{uploadedFileName}</span>
                          <button onClick={handleRemoveFile} className="ml-2 text-red-500 hover:text-red-700"><FaTimesCircle /></button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col h-full justify-between">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-blue-800 h-full">
                    <p className="font-semibold">Instructions:</p>
                    <p className="text-sm mt-1">
                      Your file's first row must be a header with columns like:<br/>
                      <span className="font-mono text-blue-600 text-xs">email, name, phone, country, status, tags</span>.<br/>
                      The <strong>email</strong> column is required.
                    </p>
                    <div className="mt-4 text-center">
                      <button onClick={downloadSampleFile} className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"><FaDownload className="mr-2" />Download Sample File</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="mt-4">
                  <List>
                      {savedLists.length > 0 ? (
                          savedLists.map((list) => (
                              <ListItem key={list._id} disablePadding>
                                  <ListItemButton onClick={() => handleSelectSavedList(list)}>
                                      <ListItemText primary={list.title} secondary={list.description || 'No description'} />
                                  </ListItemButton>
                              </ListItem>
                          ))
                      ) : (
                          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>No saved lists found.</Typography>
                      )}
                  </List>
              </div>
            )}

            {showTable && tableData.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Subscribers <span className="text-sm font-normal text-gray-500">({selectedCount} of {tableData.length} selected)</span></h3>
                <div className="border border-gray-200 rounded-md overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="form-checkbox h-4 w-4 text-blue-600"/>
                        </th>
                        {tableHeaders.map((key) => (<th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</th>))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={!!selectedEmails[row.email]} onChange={() => handleCheckboxChange(row.email)} className="form-checkbox h-4 w-4 text-blue-600"/></td>
                          {tableHeaders.map((key, colIndex) => (<td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Array.isArray(row[key]) ? row[key].join(', ') : row[key]}</td>))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => handleEditRow(row)} className="text-blue-600 hover:text-blue-900 mr-2"><FaEdit size={16} /></button>
                            <button onClick={() => handleDeleteRow(row.email)} className="text-red-600 hover:text-red-900"><FaTrashAlt size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end">
                   <button
                      onClick={() => setIsListDetailModalOpen(true)}
                      className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-green-700 transition-colors shadow-md"
                      disabled={selectedCount === 0}
                   >Save as New List...</button>
                </div>
              </div>
            )}
        </div>

        <div className="mt-8 flex justify-end">
            {activeTab === 'upload' && !showTable && (
                <button
                    onClick={handleViewFile}
                    disabled={!uploadedFileName}
                    className={`font-semibold py-2 px-6 rounded-md transition-colors shadow-md ${!uploadedFileName || tableData.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >View & Select Subscribers →</button>
            )}
        </div>
      </div>

      {/* --- Modals --- */}

      <Modal open={isListDetailModalOpen} onClose={() => setIsListDetailModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">Create New Subscriber List</Typography>
          <TextField label="List Title" value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} fullWidth required margin="normal" />
          <TextField label="Description (Optional)" value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} fullWidth multiline rows={3} margin="normal" />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={() => setIsListDetailModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirmSaveList} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create & Import'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">Edit Recipient</Typography>
          {currentEditRow && (
            <>
              {Object.keys(currentEditRow).filter(k => k !== 'originalEmail').map((key) => (
                <TextField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} name={key} value={currentEditRow[key] || ''} onChange={handleEditChange} fullWidth margin="dense" disabled={key === 'email'} />
              ))}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

        <Modal open={isSubscribersModalOpen} onClose={() => setIsSubscribersModalOpen(false)}>
            <Box sx={subscribersModalStyle}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Subscribers in "{selectedListTitle}"
                </Typography>
                {subscribersForModal.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscribersForModal.map((subscriber) => (
                                    <tr key={subscriber._id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{subscriber.email}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{subscriber.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{subscriber.phone}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{subscriber.country}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscriber.status === 'subscribed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {subscriber.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{Array.isArray(subscriber.tags) ? subscriber.tags.join(', ') : ''}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>This list has no subscribers.</Typography>
                )}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => setIsSubscribersModalOpen(false)}>Close</Button>
                </Box>
            </Box>
        </Modal>
    </div>
  );
};

export default AddRecipients;