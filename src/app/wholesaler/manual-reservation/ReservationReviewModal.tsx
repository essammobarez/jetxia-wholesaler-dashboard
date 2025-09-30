import React, { ReactNode } from 'react';
import { Button, Modal, Box, Typography, Divider, IconButton } from '@mui/material';
import { X, Edit2, CheckCircle } from 'lucide-react';
import { Dayjs } from 'dayjs';

// Import the redesigned content display component
import { ReviewDataDisplay } from './ReviewDataDisplay'; 

// --- TYPES (Copied from ManualReservation for file independence) ---
type TravellerType = 'adult' | 'child';

type Traveller = {
  id: number;
  type: TravellerType;
  title: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  nationality: string; // ISO country code
};

type Room = {
  id: number;
  roomInfo: string;
  roomName: string;
  board: string;
  roomType: string;
  price: string;
  travellers: Traveller[];
};

type Policy = {
  id: number;
  type: string;
  date: Dayjs | null;
  price: string;
};

// --- PROPS FOR MODAL ---
interface ReservationReviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void; // For "Confirm Booking"
  onEdit: () => void; // For "Edit"
  isSubmitting: boolean;
  // All the data needed for display
  data: {
    agencyName: string;
    selectedHotelDetails: any;
    checkIn: Dayjs | null;
    checkOut: Dayjs | null;
    externalId: string;
    reservationStatus: string;
    supplierName: string;
    currency: string;
    supplierCode: string;
    backofficeRef: string;
    language: string;
    agentRef: string;
    supplierConfirmation: string;
    supplierPrice: string;
    markup: string;
    commission: string;
    totalPrice: string;
    rooms: Room[];
    cancellationPolicies: Policy[];
    addedRemarks: string[];
    comments: string;
  };
}

// Inline style for the modal box (improved size and aesthetics)
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '90%', md: 1000 },
  maxHeight: '95vh',
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
};

export const ReservationReviewModal: React.FC<ReservationReviewModalProps> = ({
  open,
  onClose,
  onConfirm,
  onEdit,
  isSubmitting,
  data,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="reservation-review-modal-title"
      aria-describedby="reservation-review-modal-description"
    >
      <Box sx={modalStyle}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-20 p-1 -mt-4 -mx-4">
          <Typography id="reservation-review-modal-title" variant="h5" component="h2" className="font-bold text-gray-900">
            Review & Confirm Reservation
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <X size={24} />
          </IconButton>
        </div>
        <Divider className="mb-6" />

        <div id="reservation-review-modal-description" className="space-y-6">
          {/* Renders the beautifully laid out data */}
          <ReviewDataDisplay data={data} />
        </div>

        <Divider className="my-6" />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outlined"
            size="large"
            onClick={onEdit}
            startIcon={<Edit2 size={20} />}
            disabled={isSubmitting}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={onConfirm}
            startIcon={<CheckCircle size={20} />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};