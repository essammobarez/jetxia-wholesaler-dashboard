import React from "react";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import * as countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export interface Reservation {
  dbId: string;
  bookingId: string;
  sequenceNumber: number;
  reservationId: number;
  topStatus: string;
  createdAt: string;
  agency: {
    agencyName?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    city?: string;
    country?: string;
    profileImage?: any;
    logoUrl?: string;
  };
  agencyName: string;
  wholesaler: any;
  wholesalerName: string;
  providerId: string;
  providerName: string;
  clientRef: string;
  serviceType: string;
  initStatus: string;
  price: number;
  currency: string;
  addedTime: string;
  addedUser: string;
  paymentType: string;
  paymentStatus: string;
  rateDescription: string;
  priceIssueNet: number;
  priceIssueCommission: number;
  priceIssueSelling: number;
  cancellationDate: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  destinationCity: string;
  destinationCountry: string;
  nationality: string;
  passengers: {
    firstName: string;
    lastName: string;
    lead?: boolean;
    nationality?: string;
  }[];
  remarks: any[];
  hotelInfo: {
    id: string;
    name: string;
    stars: number;
    lastUpdated: string;
    cityId: string;
    countryId: string;
    address?: {
      fullAddress?: string;
      city?: string;
      countryCode?: string;
    };
    phone?: string;
    email?: string;
    website?: string;
    propertyNotes?: string[];
  };
  rooms: {
    id: string;
    name: string;
    board: string;
    boardBasis: string;
    info: string;
    passengerIds: number[];
  }[];
  freeCancellation: string;
  priceDetails: any;
  allRooms: {
    reservationId: number;
    status: string;
    rateDescription: string;
    priceNet: number;
    priceCommission: number;
    cancellationPolicy: any;
    guests: any[];
    remarks: any[];
    roomName: string;
    board: string;
    boardBasis: string;
    info: string;
    nationality: string;
    reference: any;
    confirmationNo: string | null;
  }[];
  source: string | null;
  geolocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

const formatDateYYYYMMDD = (dateStr: string | undefined): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateStr;
  }
};

const calculateNights = (checkIn: string | undefined, checkOut: string | undefined): number => {
  if (!checkIn || !checkOut) return 0;
  try {
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const timeDiff = date2.getTime() - date1.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  } catch (e) {
    return 0;
  }
};

const getCountryName = (code: string | undefined): string => {
  if (!code) return "N/A";
  try {
    const name = countries.getName(code.toUpperCase(), "en");
    return name || code;
  } catch (error) {
    return code;
  }
};

const styles: { [key: string]: React.CSSProperties } = {
  voucherContainer: {
    all: 'initial',
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    backgroundColor: '#e9e9e9',
    padding: '20px',
    fontSize: '10pt',
    color: '#333',
    width: '842px',
    boxSizing: 'border-box'
  },
  page: {
    backgroundColor: '#fff',
    padding: '20px',
    minHeight: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #ddd',
    paddingBottom: '15px',
    marginBottom: '15px',
  },
  headerLeft: {
    flex: '1',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  headerLogo: {
    width: '120px',
    height: 'auto',
  },
  headerCenter: {
    flex: '1',
    textAlign: 'center',
    paddingTop: '5px',
  },
  headerTitle: {
    fontSize: '24pt',
    fontWeight: 'bold',
    margin: '0 0 3px 0',
    color: '#000',
    whiteSpace: 'nowrap',
  },
  bookingDate: {
    fontSize: '10pt',
    color: '#666',
    margin: 0,
  },
  headerRight: {
    flex: '1',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  agencyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  agencyLogo: {
    width: '90px',
    height: 'auto',
    marginBottom: '8px',
  },
  agencyDetailsContainer: {
    textAlign: 'right',
    fontSize: '9pt',
    lineHeight: 1.4,
    color: '#555',
  },
  agencyDetailItem: {
    margin: 0,
  },
  rightAlignedBookingInfoContainer: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    backgroundColor: '#f7f7f7'
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    flexGrow: 1,
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  rightColumn: {
    flex: 1.3,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  section: {
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  sectionHeader: {
    padding: '8px 12px',
    backgroundColor: '#f7f7f7',
    borderBottom: '1px solid #ddd',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
  },
  sectionTitle: {
    fontSize: '13pt',
    fontWeight: 'bold',
    margin: 0,
    color: '#007bff',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  sectionContent: {
    padding: '12px',
    fontSize: '12pt',
    lineHeight: 1.5
  },
  stayDetailsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '10px',
    backgroundColor: '#f7f7f7',
  },
  stayDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    borderRight: '1px solid #eee',
    paddingRight: '8px',
    paddingLeft: '8px',
  },
  stayDetailItemLast: {
    borderRight: 'none',
  },
  stayDetailLabel: {
    fontWeight: 'bold',
    fontSize: '10pt',
    marginBottom: '3px',
    color: '#007bff',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  stayDetailValue: {
    fontSize: '11pt',
    fontWeight: 'bold',
    color: '#333',
  },
  roomTypeSection: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '12px',
    backgroundColor: '#f7f7f7',
  },
  roomTypeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11pt',
    fontWeight: 'bold',
    marginBottom: '6px',
    color: '#007bff',
  },
  roomTypeDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  roomTypeLine: {
    display: 'flex',
    gap: '6px',
    fontSize: '12pt',
  },
  roomTypeLabel: {
    fontWeight: 'bold',
    minWidth: '80px',
  },
  mapImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  remarkBox: {
    backgroundColor: '#fff0f1',
    border: '1px solid #f9c2c7',
    borderRadius: '6px',
    padding: '12px 30px',
    width: '90%',
    margin: '15px auto 0 auto',
    boxSizing: 'border-box'
  },
  remarkLabel: {
    fontWeight: 'bold',
    color: '#d9534f',
    marginRight: '8px',
    borderBottom: '1px solid #d9534f',
    paddingBottom: '5px',
  },
  remarkText: {
    fontSize: '14pt',
    lineHeight: '1.6',
    color: '#333',
    margin: 0,
  },
  footer: {
    borderTop: '1px solid #ddd',
    paddingTop: '20px',
    marginTop: '20px',
    fontSize: '10pt',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  emergencyContacts: {
    fontFamily: "'Arial Narrow', 'Helvetica Neue', sans-serif",
    textAlign: 'center',
    border: '1px solid #000',
    padding: '10px',
    margin: '0 auto',
    width: '60%',
    boxSizing: 'border-box'
  },
  emergencyText: {
    margin: '3px 0',
    fontSize: '10pt',
    fontWeight: 'bold',
  },
  notesSection: {
    fontFamily: "'Courier New', Courier, monospace",
    lineHeight: 1.5,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '13pt'
  },
  notesLine: {
    margin: 0,
  },
  guestNameSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  guestNameHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12pt',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#000',
  },
  guestNameItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
    fontSize: '10pt',
    paddingLeft: '15px',
  },
  guestDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  guestNameNumber: {
    fontWeight: 'bold',
  },
  guestNameLine: {
    display: 'flex',
    gap: '6px',
    fontSize: '12pt',
  },
  guestNameLabel: {
    fontWeight: 'bold',
  },
  bookingInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    borderTop: '1px dashed #ccc',
    paddingTop: '8px'
  },
  bookingInfoField: {
    fontSize: '12pt',
    fontWeight: 'bold',
    display: 'flex',
    gap: '4px',
  },
  bookingInfoValue: {
    fontSize: '12pt',
    fontWeight: 'normal',
  },
  hotelInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  hotelAddressWithIcon: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    fontSize: '12pt',
  },
  hotelPhoneWithIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10pt',
  },
  icon: {
    height: '16px',
    width: '16px',
    position: 'relative',
    top: '10px',
  }
};

export const VoucherTemplate: React.FC<{ reservation: Reservation }> = ({ reservation }) => {
  const { hotelInfo, checkIn, checkOut, bookingId, reservationId, passengers, allRooms, agency } = reservation;
  const nights = calculateNights(checkIn, checkOut);
  const mapImageSrc = reservation.geolocation
    ? `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${reservation.geolocation.longitude},${reservation.geolocation.latitude}&z=15&l=map&size=600,180&pt=${reservation.geolocation.longitude},${reservation.geolocation.latitude},pm2rdl`
    : "https://i.imgur.com/8cAquNo.png";

  const today = new Date();
  const bookingDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const agencyLogoSrc = agency?.logoUrl || "/images/agency-logo.png";

  return (
    <div style={styles.voucherContainer}>
      <div id="voucher-content" style={styles.page}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <img src="/images/new-logo.jpeg" alt="Booking Desk Travel" style={styles.headerLogo} crossOrigin="anonymous" />
          </div>
          <div style={styles.headerCenter}>
            <h1 style={styles.headerTitle}>Hotel Voucher</h1>
            <p style={styles.bookingDate}>Booking date: {bookingDate}</p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.agencyContainer}>
              <img src={agencyLogoSrc} alt="Agency Logo" style={styles.agencyLogo} crossOrigin="anonymous" />
              <div style={styles.agencyDetailsContainer}>
                {agency ? (
                  <>
                    <p style={styles.agencyDetailItem}>{agency.agencyName || 'N/A'}</p>
                    <p style={styles.agencyDetailItem}>{agency.phoneNumber || 'N/A'}</p>
                    <p style={styles.agencyDetailItem}>{agency.email || 'N/A'}</p>
                    <p style={styles.agencyDetailItem}>{agency.address || 'N/A'}</p>
                  </>
                ) : (
                  <p style={styles.agencyDetailItem}>Agency details not available.</p>
                )}
              </div>
            </div>
          </div>
        </header>

        <main style={styles.body}>
          <div style={styles.leftColumn}>
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  <img src="/images/icons/hotel-line.png" alt="Hotel" style={styles.icon} />
                  {hotelInfo?.name || 'Hotel Name Not Available'}
                </h2>
              </div>
              <div style={styles.sectionContent}>
                <div style={styles.hotelInfoContainer}>
                  <div style={styles.hotelAddressWithIcon}>
                    <img src="/images/icons/map-pin-line.png" alt="Address" style={styles.icon} />
                    <span>{hotelInfo?.address?.fullAddress || 'Address not available.'}</span>
                  </div>
                </div>
              </div>
            </section>
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={{...styles.sectionTitle, color: '#333'}}>
                  <img src="/images/icons/user-3-line.png" alt="Guest" style={styles.icon} />
                  <span>Guest Name</span>
                </div>
              </div>
              <div style={styles.sectionContent}>
                <div style={styles.guestNameSection}>
                  {(passengers && passengers.length > 0 ? passengers : []).map((p, index) => (
                    <div key={index} style={styles.guestNameItem}>
                      <span style={styles.guestNameNumber}>{index + 1}.</span>
                      <div style={styles.guestDetails}>
                        <div style={styles.guestNameLine}>
                          <span style={styles.guestNameLabel}>Name:</span>
                          <span>{p.firstName} {p.lastName}</span>
                        </div>
                        <div style={styles.guestNameLine}>
                          <span style={styles.guestNameLabel}>Nationality:</span>
                          <span>{getCountryName(p.nationality)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section style={styles.roomTypeSection}>
                <div style={styles.sectionHeader}>
                    <div style={{...styles.sectionTitle, color: '#333'}}>
                        <img src="/images/icons/hotel-bed-line.png" alt="Room Type" style={styles.icon} />
                        <span>Room Type</span>
                    </div>
                </div>
              <div style={styles.sectionContent}>
                <div style={styles.roomTypeDetails}>
                  <div style={styles.roomTypeLine}>
                    <span style={styles.roomTypeLabel}>Room Name:</span>
                    <span>{allRooms?.[0]?.roomName || 'N/A'}</span>
                  </div>
                  <div style={styles.roomTypeLine}>
                    <span style={styles.roomTypeLabel}>Board:</span>
                    <span>{allRooms?.[0]?.board || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div style={styles.rightColumn}>
            <div style={styles.rightAlignedBookingInfoContainer}>
              <div style={styles.bookingInfoField}>
                <span>Booking ID:</span>
                <span style={{ ...styles.bookingInfoValue, color: '#007bff', fontWeight: 'bold' }}>
                  {bookingId || 'N/A'}
                </span>
              </div>
              <div style={styles.bookingInfoField}>
                <span>Reference:</span>
                <span style={{ ...styles.bookingInfoValue, color: '#007bff', fontWeight: 'bold' }}>
                  {reservationId || 'N/A'}
                </span>
              </div>
            </div>

            <img src={mapImageSrc} alt="Hotel Location" style={styles.mapImage} crossOrigin="anonymous" />

            <div style={styles.stayDetailsRow}>
              <div style={styles.stayDetailItem}>
                <div style={styles.stayDetailLabel}>
                  <img src="/images/icons/calendar-check-line.png" alt="Check In" style={styles.icon} />
                  <span>Check In</span>
                </div>
                <span style={styles.stayDetailValue}>{formatDateYYYYMMDD(checkIn)}</span>
              </div>
              <div style={styles.stayDetailItem}>
                <div style={styles.stayDetailLabel}>
                  <img src="/images/icons/calendar-check-line.png" alt="Check Out" style={styles.icon} />
                  <span>Check Out</span>
                </div>
                <span style={styles.stayDetailValue}>{formatDateYYYYMMDD(checkOut)}</span>
              </div>
              <div style={{ ...styles.stayDetailItem, ...styles.stayDetailItemLast }}>
                <div style={styles.stayDetailLabel}>
                  <img src="/images/icons/moon-line.png" alt="Nights" style={styles.icon} />
                  <span>Room & Nights</span>
                </div>
                <span style={styles.stayDetailValue}>{allRooms?.length || 0} room / {nights || 0} nights</span>
              </div>
            </div>
          </div>
        </main>

        <div style={styles.remarkBox}>
          <p style={styles.remarkText}>
            <span style={styles.remarkLabel}>Remark:</span>
            For any complaint during your hotel stay, please report immediately before you check out, else no complaints will be accepted.
          </p>
        </div>

        <footer style={styles.footer}>
          <div style={styles.emergencyContacts}>
            <p style={{...styles.emergencyText, fontWeight: 'normal', fontSize: '12pt'}}>If you cannot allocate this booking please call:</p>
            <p style={styles.emergencyText}>
              EMERGENCY PHONES MBL: {agency?.phoneNumber || 'N/A'}
            </p>
          </div>
          <div style={styles.notesSection}>
            <p style={styles.notesLine}>
              <strong>N.B:</strong> IN CASE YOU ARE ACCOMMODATED LESS OVERNIGHTS, PLEASE MAKE SURE
            </p>
            <p style={styles.notesLine}>
              THAT HOTELIER HAS PROPERLY SIGNED AND ACCEPTED THIS MODIFICATION.
            </p>
            <p style={styles.notesLine}>
              WE CONFIRM THE AMENDMENT AND WILL INVOICE AS FOLLOWS:
            </p>
            <p style={styles.notesLine}>
              NUMBER OF NIGHTS _________ TO BE REFUNDED.
            </p>
            <p style={{...styles.notesLine, marginTop: '15px'}}>
              THE HOTEL (STAMP & SIGNATURE)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export async function generateVoucherPDF(reservation: Reservation) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  // *** FIXED BUILD ERROR: Simplified and corrected token extraction ***
  const match = document.cookie.match(/(?:^|;)\s*authToken=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : null;

  let geolocationData: { latitude: number; longitude: number } | null = null;
  let updatedHotelInfo = { ...reservation.hotelInfo };

  if (reservation.providerId && reservation.hotelInfo?.id) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const wholesalerId = localStorage.getItem('wholesalerId');

      const response = await fetch(
        `${apiUrl}hotel/${reservation.providerId}/${reservation.hotelInfo.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            wholesalerId: wholesalerId,
          }),
        }
      );
      if (response.ok) {
        const apiResponse = await response.json();
        if (apiResponse.success && apiResponse.data) {
          geolocationData = apiResponse.data.geolocation || null;
          updatedHotelInfo = { ...updatedHotelInfo, ...apiResponse.data };
        }
      }
    } catch (error) {
      console.error("Failed to fetch hotel details:", error);
    }
  }

  const reservationWithFullDetails = {
    ...reservation,
    hotelInfo: updatedHotelInfo,
    geolocation: geolocationData,
  };

  const root = createRoot(container);
  await new Promise<void>((resolve) => {
    root.render(<VoucherTemplate reservation={reservationWithFullDetails} />);
    setTimeout(resolve, 200);
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const content = container.querySelector("#voucher-content") as HTMLElement;
  if (!content) {
    console.error("Voucher content element not found!");
    document.body.removeChild(container);
    return;
  }

  const pdf = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const componentWidth = 842;
  const scale = pdfWidth / componentWidth;

  pdf.html(content, {
    callback: function (doc) {
      doc.save(`Hotel-Voucher-${reservation.bookingId || "booking"}.pdf`);
      root.unmount();
      document.body.removeChild(container);
    },
    html2canvas: {
      scale: scale,
      useCORS: true,
      backgroundColor: '#ffffff',
    },
    autoPaging: "none",
    x: 0,
    y: 0,
    width: componentWidth,
    windowWidth: componentWidth,
  });
}