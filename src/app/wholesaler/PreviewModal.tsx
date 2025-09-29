import React, { ReactNode } from 'react';
import { Modal, Box, Typography, IconButton, Divider, Grid, Button, Paper, Stack, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Clock, Wallet, Edit, CheckCircle, X, Calendar, User, Building, MapPin, Hash, DollarSign, FileText, MessageSquare, Briefcase, Star, BedDouble, Check, Code } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { Dayjs } from 'dayjs';

// --- TYPES (Copied from parent to be self-contained) ---
type Traveller = {
  id: number;
  type: 'adult' | 'child';
  title: string;
  firstName: string;
  lastName: string;
  birthday: string | null;
  nationality: string;
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

// --- PROPS INTERFACE ---
interface PreviewModalProps {
  isPreviewModalOpen: boolean;
  setIsPreviewModalOpen: (isOpen: boolean) => void;
  handleConfirmBooking: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  
  // Data props
  agencyName: string;
  agencyData: { walletBalance: number; markup: number };
  selectedHotelDetails: any | null;
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
  rooms: Room[];
  supplierPrice: string;
  markup: string;
  totalPrice: string;
  paymentMethod: string;
  paymentDeadline: Dayjs | null;
  cancellationPolicies: Policy[];
  addedRemarks: string[];
  comments: string;
}

// --- HELPER COMPONENTS ---
const InfoRow = ({ icon, label, value, sx = {} }: { icon: React.ReactNode; label: string; value: React.ReactNode; sx?: object }) => (
  <Grid item xs={12} sm={6} display="flex" alignItems="start" gap={1.5} sx={{ ...sx, py: 0.5 }}>
    <Box color="text.secondary" mt={0.75} flexShrink={0}>{icon}</Box>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
      <Typography variant="body1" fontWeight={500}>{value || 'N/A'}</Typography>
    </Box>
  </Grid>
);

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode; }) => (
  <Grid item xs={12} sm={6} py={0.5}>
    <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>{label}</Typography>
    <Typography variant="body1" fontWeight={500}>{value || 'N/A'}</Typography>
  </Grid>
);

const SectionCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
    <Typography variant="h6" fontWeight="bold" mb={2.5}>{title}</Typography>
    {children}
  </Paper>
);

// --- MAIN MODAL COMPONENT ---
const PreviewModal: React.FC<PreviewModalProps> = ({
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  handleConfirmBooking,
  isSubmitting,
  submitError,
  agencyName,
  agencyData,
  selectedHotelDetails,
  checkIn,
  checkOut,
  externalId,
  reservationStatus,
  supplierName,
  currency,
  supplierCode,
  backofficeRef,
  language,
  agentRef,
  supplierConfirmation,
  rooms,
  supplierPrice,
  markup,
  totalPrice,
  paymentMethod,
  paymentDeadline,
  cancellationPolicies,
  addedRemarks,
  comments,
}) => {
  return (
    <Modal open={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', md: '90%' },
        maxWidth: 900,
        bgcolor: 'grey.100',
        boxShadow: 24,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
      }}>
        {/* Sticky Header */}
        <Box sx={{
          p: 2.5,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Confirm Reservation Details
          </Typography>
          <IconButton onClick={() => setIsPreviewModalOpen(false)}><X size={20} /></IconButton>
        </Box>

        {/* Scrollable Content Area */}
        <Box sx={{ overflowY: 'auto' }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>

              <SectionCard title="Agency Details">
                <Grid container spacing={2}>
                  <InfoRow icon={<Building size={20} />} label="Agency Name" value={agencyName} />
                  <InfoRow 
                    icon={<Wallet size={20} />} 
                    label="Available Credit" 
                    value={`${agencyData.walletBalance.toFixed(2)} ${currency || 'USD'}`} 
                  />
                </Grid>
              </SectionCard>

              <SectionCard title="Booking Overview">
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <DetailItem 
                    label="Hotel" 
                    value={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1" fontWeight={500}>{selectedHotelDetails?.name}</Typography>
                        <Chip
                          icon={<Star sx={{ fontSize: 16, color: '#fdd835 !important' }} />}
                          label={selectedHotelDetails?.rating}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    } 
                  />
                  <DetailItem 
                    label="Destination" 
                    value={`${selectedHotelDetails?.location?.city}, ${selectedHotelDetails?.location?.countryCode}`} 
                  />
                  <DetailItem 
                    label="Check-In" 
                    value={checkIn ? checkIn.format('ddd, D MMM YYYY') : 'N/A'} 
                  />
                  <DetailItem 
                    label="Check-Out" 
                    value={checkOut ? checkOut.format('ddd, D MMM YYYY') : 'N/A'} 
                  />
                </Grid>
              </SectionCard>

              <SectionCard title="External Details">
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <DetailItem label="Supplier Confirmation #" value={supplierConfirmation} />
                  <DetailItem label="External ID" value={externalId} />
                  <DetailItem label="Reservation Status" value={reservationStatus} />
                  <DetailItem label="Supplier Name" value={supplierName} />
                  <DetailItem label="Supplier Code" value={supplierCode} />
                  <DetailItem label="Backoffice Ref" value={backofficeRef} />
                  <DetailItem label="Language" value={language} />
                  <DetailItem label="Agent Ref" value={agentRef} />
                </Grid>
              </SectionCard>
              
              <SectionCard title="Rooms & Guests">
                <Stack spacing={2.5}>
                  {rooms.map((room, index) => (
                    <Paper key={room.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight="bold" color="primary.main" gutterBottom>
                        Room {index + 1}: {room.roomName || 'N/A'}
                      </Typography>
                      <Stack direction="row" spacing={4} mb={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>Board</Typography>
                          <Typography fontWeight={500}>{room.board}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>Room Price</Typography>
                          <Typography fontWeight={500}>{room.price} {currency}</Typography>
                        </Box>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>Guests:</Typography>
                      <List dense disablePadding>
                        {room.travellers.map((t, guestIndex) => (
                          <ListItem key={t.id} disableGutters sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mr: 1 }}><User size={18} /></ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" fontWeight={500}>
                                  {`${t.title} ${t.firstName} ${t.lastName}`}
                                </Typography>
                              } 
                            />
                            {guestIndex === 0 && (
                              <Chip 
                                label="Lead" 
                                size="small" 
                                color="info" 
                                variant="outlined" 
                                sx={{ height: 24, fontSize: '0.75rem', mr: 1 }}
                              />
                            )}
                            <ReactCountryFlag 
                              countryCode={t.nationality} 
                              svg 
                              style={{ width: '1.2em', height: '1.2em' }} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  ))}
                </Stack>
              </SectionCard>

              <SectionCard title="Price Summary">
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" fontWeight={500}>Total Supplier Price</Typography>
                    <Typography fontWeight={500}>{supplierPrice} {currency}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" fontWeight={500}>Agency Markup</Typography>
                    <Typography fontWeight={500}>{markup || 0}%</Typography>
                  </Box>
                  <Box sx={{
                    p: 2,
                    mt: 1,
                    bgcolor: 'success.light',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" fontWeight="bold" color="success.darker">Final Booking Price</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.darker">{totalPrice} {currency}</Typography>
                  </Box>
                </Stack>
              </SectionCard>
              
              <SectionCard title="Payment & Policies">
                <Grid container spacing={2}>
                  <InfoRow icon={<Wallet size={20} />} label="Payment Method" value={paymentMethod} />
                  {paymentMethod === 'PAYLATER' && paymentDeadline && (
                    <InfoRow 
                      icon={<Clock size={20} />} 
                      label="Payment Deadline" 
                      value={paymentDeadline.format('ddd, D MMMM YYYY')} 
                    />
                  )}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1.5 }}>
                  Cancellation Policies:
                </Typography>
                {cancellationPolicies.length > 0 ? (
                  <List dense disablePadding>
                    {cancellationPolicies.map(p => (
                      <ListItem key={p.id} disableGutters sx={{ py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 32, mr: 1 }}>
                          <Check size={18} color="green" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" fontWeight={500}>
                              Pay {p.price} {currency} if cancelled after {p.date ? p.date.format('D MMM YYYY') : 'N/A'}
                            </Typography>
                          } 
                          secondary={p.type} 
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No cancellation policies added.</Typography>
                )}
              </SectionCard>
              
              <SectionCard title="Additional Information">
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>Backoffice Remarks</Typography>
                    <Typography variant="body1" fontWeight={500}>{addedRemarks.join(', ') || 'None'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>Comments</Typography>
                    <Typography variant="body1" fontWeight={500}>{comments || 'None'}</Typography>
                  </Box>
                </Stack>
              </SectionCard>
            </Stack>
          </Box>
          
          {/* Action Buttons Footer */}
          <Box sx={{
            p: 2.5,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }}>
            {submitError && (
              <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontWeight: 500 }}>
                {submitError}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Edit size={20} />}
                onClick={() => setIsPreviewModalOpen(false)}
                sx={{ px: 2.5, py: 1.25 }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<CheckCircle size={20} />}
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                sx={{ px: 2.5, py: 1.25 }}
              >
                {isSubmitting ? 'Confirming...' : 'Booking Confirm'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default PreviewModal;