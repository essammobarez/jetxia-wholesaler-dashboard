import React from 'react';
import Link from 'next/link';
import { Box, Paper, Typography, Divider, Button, Container, Stack } from '@mui/material';
import { Download, Repeat, PartyPopper, Loader2, FileText } from 'lucide-react';

// Define the shape of the data prop
interface BookingSuccessData {
    bookingId: string;
    booking: {
        hotel: {
            name: string;
        };
    };
}

// Define the component's props interface
interface BookingSuccessProps {
    data: BookingSuccessData;
    onBookAgain: () => void;
    onDownloadVoucher: (data: BookingSuccessData) => void;
    onDownloadInvoice: (data: BookingSuccessData) => void;
    isDownloadingVoucher: boolean;
    isDownloadingInvoice: boolean;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({ 
    data, 
    onBookAgain, 
    onDownloadVoucher, 
    onDownloadInvoice, 
    isDownloadingVoucher, 
    isDownloadingInvoice 
}) => {
    
    // Define the URL for the booking overview page
    const overviewUrl = `/wholesaler?page=Booking&tab=Overview&bookingId=${data.bookingId}`;

    // Styles for the main action buttons (Download Voucher/Invoice)
    const primaryButtonStyles = {
        py: 1.5,
        px: 3,
        fontWeight: '600',
        borderRadius: '8px',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-in-out',
        width: { xs: '100%', sm: '250px' },
        height: '50px',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
    };

    return (
        <Box
            sx={{
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3 },
                background: 'linear-gradient(to top, #f3f4f6, #ffffff)',
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 5 },
                        borderRadius: 4,
                        textAlign: 'center',
                        width: '100%',
                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.07)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Box 
                        sx={{ 
                            width: 72, 
                            height: 72, 
                            bgcolor: 'success.lighter', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            mx: 'auto', 
                            mb: 2 
                        }}
                    >
                        <PartyPopper size={40} className="text-green-600" />
                    </Box>

                    <Typography 
                        variant="h4" 
                        component="h1" 
                        fontWeight="bold" 
                        color="success.darker" 
                        gutterBottom
                    >
                        Booking Confirmed!
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '450px', mx: 'auto' }}>
                        Your reservation at <strong>{data.booking.hotel.name}</strong> has been successfully created.
                    </Typography>

                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'primary.lighter',
                            borderRadius: 2,
                            mb: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1.5,
                            border: '1px solid',
                            borderColor: 'primary.light',
                        }}
                    >
                        <Typography variant="body1" fontWeight="500" color="primary.darker">
                            Booking ID:
                        </Typography>
                        <Link href={overviewUrl} passHref>
                            <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                color="primary.dark" 
                                component="a"
                                sx={{ 
                                    textDecoration: 'none', 
                                    borderBottom: '2px solid',
                                    borderColor: 'primary.main',
                                    '&:hover': { color: 'primary.main' } 
                                }}
                            >
                                {data.bookingId}
                            </Typography>
                        </Link>
                    </Box>

                    <Divider sx={{ my: 3, mb: 4 }} />
                    
                    {/* Simplified Layout */}
                    <Stack spacing={4} alignItems="center">
                        {/* --- ROW 1: Download Buttons --- */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                startIcon={isDownloadingVoucher ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                onClick={() => onDownloadVoucher(data)}
                                disabled={isDownloadingVoucher}
                                sx={primaryButtonStyles}
                            >
                                {isDownloadingVoucher ? 'Downloading...' : 'Download Voucher'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={isDownloadingInvoice ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                onClick={() => onDownloadInvoice(data)}
                                disabled={isDownloadingInvoice}
                                sx={primaryButtonStyles}
                            >
                                {isDownloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                            </Button>
                        </Stack>

                        {/* --- ROW 2: Centered "Book Again" Button --- */}
                        <Box>
                            <Button
                                variant="text"
                                startIcon={<Repeat size={18} />}
                                onClick={onBookAgain}
                            >
                                Book Again
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default BookingSuccess;