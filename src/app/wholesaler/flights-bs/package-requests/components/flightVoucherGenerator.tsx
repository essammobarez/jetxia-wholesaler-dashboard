// components/flightVoucherGenerator.tsx

'use client';

import React from 'react';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import { ApiFlightBooking } from '../PackageRequestsModule'; // Adjust path if needed

// --- HELPER FUNCTIONS ---
const formatDateDDMMYYYY = (dateStr: string | undefined | Date): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    if (typeof dateStr === 'string') {
      return dateStr;
    }
    return '-';
  }
};

// --- ENHANCED STYLES: Modern Card-Based Design ---
const styles: { [key: string]: React.CSSProperties } = {
  voucherContainer: {
    all: 'initial',
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    backgroundColor: '#f8fafc',
    padding: '32px',
    fontSize: '10pt',
    color: '#1e293b',
    width: '842px',
    boxSizing: 'border-box',
    minHeight: '100vh',
  },
  page: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
    padding: '32px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    flex: 1,
  },
  headerLogo: {
    width: '110px',
    height: 'auto',
    objectFit: 'contain',
  },
  companyInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  companyName: {
    fontWeight: '700',
    fontSize: '18pt',
    margin: '0',
    color: '#0f172a',
  },
  companyAddress: {
    fontSize: '9.5pt',
    margin: '4px 0 0',
    color: '#64748b',
  },
  voucherTitle: {
    fontSize: '20pt',
    fontWeight: '800',
    color: '#1d4ed8',
    margin: '0',
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  bookingInfoContainer: {
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingInfoTitle: {
    fontSize: '14pt',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0',
  },
  bookingInfoDetails: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  bookingInfoLine: {
    margin: '0',
    fontSize: '10.5pt',
  },
  bookingInfoLabel: {
    color: '#475569',
    fontWeight: '500',
  },
  bookingInfoValue: {
    color: '#1d4ed8',
    fontWeight: '700',
    marginLeft: '6px',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: '14pt',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0',
    padding: '16px 24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  sectionContent: {
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  infoItem: {
    margin: '0',
    fontSize: '11pt',
    lineHeight: 1.5,
  },
  infoLabel: {
    color: '#64748b',
    display: 'block',
    fontSize: '10pt',
    marginBottom: '4px',
    fontWeight: '600',
  },
  infoValue: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '11pt',
  },
  passengerTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    textAlign: 'left',
    padding: '12px 16px',
    borderBottom: '2px solid #cbd5e1',
    fontSize: '10.5pt',
    color: '#334155',
    fontWeight: '600',
  },
  tableCell: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '10.5pt',
    color: '#1e293b',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  supportSection: {
    backgroundColor: '#f0f9ff',
    border: '1px dashed #bae6fd',
    borderRadius: '10px',
    padding: '20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  footerNotes: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
    fontSize: '9.5pt',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.6,
    marginTop: '8px',
  },
};

// --- FLIGHT VOUCHER REACT COMPONENT ---
export const FlightVoucherTemplate: React.FC<{
  reservation: ApiFlightBooking;
}> = ({ reservation }) => {
  const fallbackLogoUrl = 'https://i.imgur.com/1Y2v4Yy.png';
  const agencyName = 'Booking Desk Travel';
  const agencyAddress = reservation.agency.email;

  return (
    <div style={styles.voucherContainer}>
      <div id="voucher-content" style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <img
              src={fallbackLogoUrl}
              alt="Agency Logo"
              style={styles.headerLogo}
              crossOrigin="anonymous"
            />
            <div style={styles.companyInfo}>
              <p style={styles.companyName}>{agencyName}</p>
              {/* <p style={styles.companyAddress}>{agencyAddress}</p> */}
            </div>
          </div>
          <div>
            <h1 style={styles.voucherTitle}>Flight Voucher</h1>
          </div>
        </header>

        <div style={styles.bookingInfoContainer}>
          <h2 style={styles.bookingInfoTitle}>Booking Information</h2>
          <div style={styles.bookingInfoDetails}>
            <p style={styles.bookingInfoLine}>
              <span style={styles.bookingInfoLabel}>Booking ID:</span>
              <span style={styles.bookingInfoValue}>{reservation.reference}</span>
            </p>
            <p style={styles.bookingInfoLine}>
              <span style={styles.bookingInfoLabel}>Booking date:</span>
              <span style={styles.bookingInfoValue}>
                {formatDateDDMMYYYY(reservation.createdAt)}
              </span>
            </p>
          </div>
        </div>

        <main style={styles.body}>
          {/* Flight Details Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Flight Details</h3>
            <div style={styles.sectionContent}>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Airline</span>
                <span style={styles.infoValue}>
                  {reservation.blockSeat.airline.name} (
                  {reservation.blockSeat.airline.code})
                </span>
              </p>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Flight</span>
                <span style={styles.infoValue}>{reservation.blockSeat.name}</span>
              </p>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Route</span>
                <span style={styles.infoValue}>
                  {reservation.blockSeat.route.from.iataCode} to{' '}
                  {reservation.blockSeat.route.to.iataCode}
                </span>
              </p>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Trip Type</span>
                <span style={styles.infoValue}>
                  {reservation.trip.tripType.replace('_', ' ')}
                </span>
              </p>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Departure Date</span>
                <span style={styles.infoValue}>
                  {formatDateDDMMYYYY(reservation.trip.departureDate)}
                </span>
              </p>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Return Date</span>
                <span style={styles.infoValue}>
                  {formatDateDDMMYYYY(reservation.trip.returnDate) || 'N/A'}
                </span>
              </p>
            </div>
          </div>

          {/* Passenger Details Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Passenger Details</h3>
            <div style={{ padding: '0 24px 24px', overflowX: 'auto' }}>
              <table style={styles.passengerTable}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Type</th>
                    <th style={styles.tableHeader}>Passport</th>
                    <th style={styles.tableHeader}>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {reservation.passengers.map((pax, index) => (
                    <tr
                      key={index}
                      style={index % 2 === 1 ? styles.tableRowEven : {}}
                    >
                      <td style={styles.tableCell}>
                        {pax.title} {pax.firstName} {pax.lastName}
                      </td>
                      <td style={styles.tableCell}>{pax.paxType}</td>
                      <td style={styles.tableCell}>{pax.passportNumber}</td>
                      <td style={styles.tableCell}>
                        {formatDateDDMMYYYY(pax.passportExpiry)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 24/7 Service & Remarks Section - Styled as a mini-card */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Support & Remarks</h3>
            <div style={styles.supportSection}>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>24/7 customer service</span>
                <span style={styles.infoValue}>+44 20 3318 0444</span>
              </p>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Remark</span>
                <span style={styles.infoValue}>-</span>
              </p>
            </div>
          </div>
        </main>

        <footer style={styles.footerNotes}>
          Thank you for booking with us. Please verify all details and contact
          us immediately if you find any discrepancies.
        </footer>
      </div>
    </div>
  );
};

// --- PDF GENERATION FUNCTION (UNCHANGED LOGIC) ---
export async function generateFlightVoucherPDF(reservation: ApiFlightBooking) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  const root = createRoot(container);
  await new Promise<void>(resolve => {
    root.render(<FlightVoucherTemplate reservation={reservation} />);
    setTimeout(resolve, 200);
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  const content = container.querySelector('#voucher-content') as HTMLElement;
  if (!content) {
    console.error('Voucher content element not found!');
    document.body.removeChild(container);
    return;
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const componentWidth = 842;
  const scale = pdfWidth / componentWidth;

  pdf.html(content, {
    callback: function (doc) {
      doc.save(`Flight-Voucher-${reservation.reference || 'booking'}.pdf`);
      root.unmount();
      document.body.removeChild(container);
    },
    html2canvas: {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    },
    autoPaging: 'none',
    x: 0,
    y: 0,
    width: componentWidth,
    windowWidth: componentWidth,
  });
}