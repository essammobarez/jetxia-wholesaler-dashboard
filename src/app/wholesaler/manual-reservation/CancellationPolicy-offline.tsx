// components/CancellationPolicy.tsx

import React, { useState } from 'react';
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import { Trash2, Edit, Plus } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

interface Policy {
  id: number;
  type: string;
  date: Dayjs | null;
  price: string;
}

interface CancellationPolicyProps {
  policyOptions: { code: string; name: string }[];
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
}

export const CancellationPolicy: React.FC<CancellationPolicyProps> = ({
  policyOptions,
  policies,
  setPolicies,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  
  // State for the form fields in the modal
  const [policyType, setPolicyType] = useState('');
  const [policyDate, setPolicyDate] = useState<Dayjs | null>(dayjs());
  const [policyPrice, setPolicyPrice] = useState('');

  const handleOpenModal = (policy?: Policy) => {
    if (policy) {
      setCurrentPolicy(policy);
      setPolicyType(policy.type);
      setPolicyDate(policy.date);
      setPolicyPrice(policy.price.replace('$', ''));
    } else {
      setCurrentPolicy(null);
      setPolicyType('');
      setPolicyDate(dayjs());
      setPolicyPrice('');
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSavePolicy = () => {
    if (currentPolicy) {
      setPolicies(prevPolicies => prevPolicies.map(p =>
        p.id === currentPolicy.id
          ? { ...p, type: policyType, date: policyDate, price: `$${policyPrice}` }
          : p
      ));
    } else {
      const newPolicy: Policy = {
        id: Date.now(), // Using timestamp for a simple unique key for the session
        type: policyType,
        date: policyDate,
        price: `$${policyPrice}`,
      };
      setPolicies(prevPolicies => [...prevPolicies, newPolicy]);
    }
    handleCloseModal();
  };

  const handleRemovePolicy = (id: number) => {
    setPolicies(prevPolicies => prevPolicies.filter(policy => policy.id !== id));
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Cancellation Policy</h2>
          <Button variant="outlined" startIcon={<Plus />} onClick={() => handleOpenModal()}>
            Add New Cancellation Policy
          </Button>
        </div>
        <div className="space-y-6">
          {policies.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-600">
                    <th className="p-2 font-medium text-center">SL</th>
                    <th className="p-2 font-medium text-center">Type</th>
                    <th className="p-2 font-medium text-center">Date</th>
                    <th className="p-2 font-medium text-center">Price</th>
                    <th className="p-2 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy, index) => (
                    <tr key={policy.id} className="text-gray-500">
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2 text-center">{policy.type}</td>
                      <td className="p-2 text-center">{policy.date?.format('YYYY-MM-DD')}</td>
                      <td className="p-2 text-center">{policy.price}</td>
                      <td className="p-2">
                        <div className="flex justify-center items-center space-x-2">
                          <IconButton onClick={() => handleOpenModal(policy)} size="small" color="primary">
                            <Edit className="w-4 h-4" />
                          </IconButton>
                          <IconButton onClick={() => handleRemovePolicy(policy.id)} size="small" color="error">
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
          <Typography variant="h6" component="h2" gutterBottom>
            {currentPolicy ? 'Edit Cancellation Policy' : 'Add New Cancellation Policy'}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="space-y-4 mt-4">
              <TextField
                select
                label="Policy Type"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                fullWidth
                variant="outlined"
              >
                {policyOptions.map((option) => (
                  <MenuItem key={option.code} value={option.name}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
              <DatePicker
                label="Cancellation Date"
                value={policyDate}
                onChange={(newValue) => setPolicyDate(newValue)}
                format="YYYY-MM-DD"
                slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
              />
              <TextField
                label="Cancellation Price"
                value={policyPrice}
                onChange={(e) => setPolicyPrice(e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography className="mr-1">$</Typography>
                }}
              />
            </div>
          </LocalizationProvider>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={handleCloseModal} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} variant="contained" color="primary">
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};