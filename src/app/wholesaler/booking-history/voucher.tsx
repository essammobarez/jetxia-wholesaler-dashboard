import React from "react";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import * as countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

// Register the English language data for the country code conversion
countries.registerLocale(en);

// --- RESERVATION INTERFACE (MODIFIED) ---
// This interface now matches the Reservation object created in BookingsPage.tsx
export interface Reservation {
  reservationId?: string | number; // Accept number from allRoomsData
  bookingId?: string;
  providerId?: string;
  checkIn?: string;
  checkOut?: string;
  agency?: {
    agencyName?: string;
    address?: string;
    phoneNumber?: string;
    logoUrl?: string | null; // --- START: ADDED UPDATE ---
    // profileImage is no longer expected from the main response
  };
  passengers?: { firstName: string; lastName: string; lead?: boolean; nationality?: string }[];
  hotelInfo?: {
    id?: string;
    name?: string;
    starRating?: number; // Use 'stars' from hotelInfo, renamed to starRating
    stars?: number; // Keep stars as it comes from fetchReservations
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
  cancellationPolicy?: {
    date?: string;
    policies?: {
      date: string;
      charge: { value: number; currency: string };
    }[];
    description?: string;
  };
  geolocation?: {
    latitude: number;
    longitude: number;
  } | null;
  allRooms?: {
    roomName?: string;
    guests: number; // This is a number (guests.length)
    bedPreferences?: string;
    board?: string;
  }[];
  amenities?: string[];
  priceDetails?: {
    roomTotal: number;
    breakfast: number;
    cityTax: number;
    serviceFee: number;
    currency: string;
  };
  specialRequests?: string[]; // This will be populated from fetchReservations
}

// --- HELPER FUNCTIONS (Unchanged) ---
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

const formatDateDDMMYYYY = (dateStr: string | undefined | Date): string => {
  if (!dateStr) return "-";
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
    return "-";
  }
};

const formatDateWithDay = (dateStr: string | undefined): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    // Adjust for timezone to prevent off-by-one day errors
    const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return utcDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

const bufferToDataUrl = (imageBuffer: any): string | null => {
  // This function will now likely receive undefined and return null
  if (!imageBuffer || !imageBuffer.data || !Array.isArray(imageBuffer.data.data) || imageBuffer.data.data.length === 0) {
    return null;
  }
  try {
    const byteArray = new Uint8Array(imageBuffer.data.data);
    let binary = '';
    byteArray.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    const base64String = window.btoa(binary);
    return `data:${imageBuffer.contentType};base64,${base64String}`;
  } catch (error) {
    console.error("Error converting image buffer to data URL:", error);
    return null;
  }
};


// --- STYLES OBJECT (Unchanged) ---
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
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  headerLogo: {
    width: '80px',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '4px',
  },
  companyInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.4,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: '16pt',
    margin: 0,
    color: '#000',
  },
  companyAddress: {
    fontSize: '9pt',
    margin: 0,
    color: '#555',
  },
  voucherTitle: {
    fontSize: '18pt',
    fontWeight: 'bold',
    color: '#0D6EFD',
    margin: 0,
  },
  bookingInfoContainer: {
    backgroundColor: '#dbeafe', // bg-blue-100 equivalent
    padding: '12px 20px', // MODIFIED: Changed top/bottom padding to 12px
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
  },
  bookingInfoTitle: {
    fontSize: '14pt',
    fontWeight: 'bold',
    color: '#212529',
    margin: 0,
    position: 'relative', // MODIFIED
    top: '-3px', // MODIFIED: Moved up by 3px
  },
  bookingInfoDetails: {
    textAlign: 'right',
  },
  bookingInfoLine: {
    margin: '2px 0',
    fontSize: '10pt',
  },
  bookingInfoLabel: {
    color: '#6c757d',
  },
  bookingInfoValue: {
    color: '#0D6EFD',
    fontWeight: 'bold',
    marginLeft: '5px'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '15px',
  },
  hotelInfoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px'
  },
  hotelName: {
    fontSize: '22pt',
    fontWeight: 'bold',
    margin: 0,
    color: '#000',
  },
  addressLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#555',
    fontSize: '10pt',
  },
  cityLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  smallIcon: {
    width: '16px',
    height: '16px',
    position: 'relative',
    top: '7px',
  },
  cityLink: {
    color: '#0D6EFD',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '10pt',
  },
  roomDetailsSection: {
    lineHeight: 1.5,
    borderBottom: '1px solid #eee',
    paddingBottom: '15px'
  },
  roomName: {
    fontSize: '13pt',
    fontWeight: 'bold',
    margin: 0,
  },
  roomBoard: {
    fontSize: '10pt',
    color: '#555',
    margin: 0,
  },
  hotelStars: {
    fontSize: '10pt',
    color: '#555',
    margin: 0,
  },
  stayDetailsGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },
  stayDetailColumn: {
    flex: 1,
    padding: '0 10px',
    textAlign: 'center',
  },
  stayDetailLabel: {
    fontSize: '12pt',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#333'
  },
  stayDetailValue: {
    fontSize: '11pt',
    margin: 0,
    color: '#000',
  },
  stayDetailTime: {
    fontSize: '9pt',
    color: '#777',
    margin: '3px 0 0 0',
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    marginTop: '0px'
  },
  mapImage: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #ddd',
    display: 'block',
  },
  mapOverlayCard: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '6px',
    padding: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    maxWidth: '300px',
    boxSizing: 'border-box',
  },
  mapOverlayHotelName: {
    fontSize: '11pt',
    fontWeight: 'bold',
    color: '#212529',
    margin: '0 0 5px 0',
  },
  mapOverlayAddress: {
    fontSize: '9pt',
    color: '#555',
    margin: 0,
    lineHeight: 1.4,
  },
  infoRowContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '15px',
    width: '100%',
  },
  guestInfoSection: {
    padding: '12px 20px 12px 0',
    // border: '1px solid #ddd', // Removed
    // borderRadius: '6px', // Removed
    flex: 1,
    boxSizing: 'border-box',
  },
  guestInfoTitle: {
    fontSize: '14pt',
    fontWeight: 'bold',
    color: '#212529',
    margin: '0 0 10px 0',
  },
  guestNameAndNationality: {
    fontSize: '12pt',
    color: '#000',
    margin: '0 0 5px 0',
  },
  guestCountLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#555',
    fontSize: '10pt',
  },
  specialRequestsSection: {
    padding: '12px 20px',
    // border: '1px solid #ddd', // Removed
    // borderRadius: '6px', // Removed
    flex: 1,
    boxSizing: 'border-box',
  },
  specialRequestsTitle: {
    fontSize: '14pt',
    fontWeight: 'bold',
    color: '#212529',
    margin: '0 0 10px 0',
  },
  specialRequestsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  specialRequestsGridItem: {
    backgroundColor: '#e7f3ff',
    color: '#0d6efd',
    paddingTop: '0px',
    paddingBottom: '12px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: '5px',
    fontSize: '10pt',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  helpSection: {
    backgroundColor: '#f8f9fa',
    padding: '10px 20px',
    borderRadius: '8px',
    marginTop: '0px',
  },
  helpTitle: {
    fontSize: '13pt',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  helpText: {
    fontSize: '10pt',
    color: '#555',
    margin: 0,
  },
  footerNotes: {
    borderTop: '1px solid #ddd',
    paddingTop: '15px',
    marginTop: '15px',
    width: '100%',
  },
  footerImage: {
    width: '100%',
    display: 'block',
    objectFit: 'contain',
  }
};

// --- VOUCHER REACT COMPONENT (MODIFIED) ---
// Removed `agencyProfile` prop, as this data now comes from `reservation.agency`
export const VoucherTemplate: React.FC<{ reservation: Reservation }> = ({ reservation }) => {
  const hotel = reservation.hotelInfo;
  const nights = calculateNights(reservation.checkIn, reservation.checkOut);

  // --- MODIFICATION: Read agency data directly from the reservation object ---
  const agencyData = reservation.agency || {};

  // --- START: ADDED UPDATE ---
  // Helper function to proxy external URLs via the app's API route
  const proxied = (url: string | null | undefined) => {
    if (!url) return null;
    // Use the API route /api/proxy to fetch the image
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  const fallbackLogoUrl = "https://i.imgur.com/1Y2v4Yy.png";
  
  // Proxy the agency logo, or if it doesn't exist, proxy the fallback logo
  const logoSrc = proxied(agencyData.logoUrl) || proxied(fallbackLogoUrl);
  // --- END: ADDED UPDATE ---

  const agencyName = agencyData.agencyName || "Booking Desk Travel";

  // Use only the address field as city/country are not in the new agency object
  const agencyAddress = agencyData.address || "123 Travel Lane, Suite 100, Dubai, UAE";
  const agencyPhone = agencyData.phoneNumber || "+971 506942880";

  // --- START: ADDED UPDATE ---
  // Proxy the Yandex map image and its fallback as well
  const yandexMapUrl = reservation.geolocation
    ? `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${reservation.geolocation.longitude},${reservation.geolocation.latitude}&z=15&l=map&size=600,300&pt=${reservation.geolocation.longitude},${reservation.geolocation.latitude},pm2rdl`
    : null;
  const mapFallbackUrl = "https://i.imgur.com/8cAquNo.png";
  
  const mapImageSrc = proxied(yandexMapUrl) || proxied(mapFallbackUrl);
  // --- END: ADDED UPDATE ---

  const today = new Date();

  const leadPassenger = (reservation.passengers && reservation.passengers.length > 0)
    ? reservation.passengers[0]
    : { firstName: 'N/A', lastName: 'N/A', nationality: 'N/A' };

  const totalGuests = reservation.passengers?.length || 0;

  // This logic remains the same and will now work because `reservation.specialRequests` is populated
  const hasSpecialRequests = reservation.specialRequests && reservation.specialRequests.length > 0;

  // Use hotelInfo.stars, which is passed from fetchReservations
  const hotelStarRating = reservation.hotelInfo?.stars || reservation.hotelInfo?.starRating || 0;

  return (
    <div style={styles.voucherContainer}>
      <div id="voucher-content" style={styles.page}>

        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <img
              src={logoSrc || ''} // Use proxied URL or fallback
              alt={agencyName}
              style={styles.headerLogo}
              crossOrigin="anonymous" // Required for html2canvas to process the proxied image
            />
            <div style={styles.companyInfo}>
              <p style={styles.companyName}>{agencyName}</p>
              <p style={styles.companyAddress}>{agencyAddress}</p>
              <p style={styles.companyAddress}>{agencyPhone}</p>
            </div>
          </div>
          <div>
            <h1 style={styles.voucherTitle}>HOTEL VOUCHER</h1>
          </div>
        </header>

        <div style={styles.bookingInfoContainer}>
          <h2 style={styles.bookingInfoTitle}>Booking Information</h2>
          <div style={styles.bookingInfoDetails}>
            <p style={styles.bookingInfoLine}>
              <span style={styles.bookingInfoLabel}>Booking ID: </span>
              <span style={styles.bookingInfoValue}>{reservation.bookingId || 'N/A'}</span>
            </p>
            <p style={styles.bookingInfoLine}>
              <span style={styles.bookingInfoLabel}>Reference: </span>
              <span style={styles.bookingInfoValue}>{String(reservation.reservationId || 'N/A')}</span>
            </p>
            <p style={styles.bookingInfoLine}>
              <span style={styles.bookingInfoLabel}>Booking date: </span>
              <span style={styles.bookingInfoValue}>{formatDateDDMMYYYY(today.toISOString())}</span>
            </p>
          </div>
        </div>

        <main style={styles.body}>
          <div style={styles.hotelInfoSection}>
            <h2 style={styles.hotelName}>{hotel?.name || 'N/A'}</h2>
            <div style={styles.addressLine}>
              {/* These local images are same-origin and do NOT need the proxy */}
              <img src="/images/icons/map-pin-line.png" alt="address" style={styles.smallIcon} />
              <span>{hotel?.address?.fullAddress || 'N/A'}</span>
            </div>
            <div style={styles.cityLine}>
              <a href="#" style={styles.cityLink}>{hotel?.address?.city || 'N/A'}</a>
            </div>
          </div>

          <div style={styles.roomDetailsSection}>
            <p style={styles.roomName}>Room 1: {reservation.allRooms?.[0]?.roomName || 'N/A'}</p>
            <p style={styles.roomBoard}>({reservation.allRooms?.[0]?.board || 'N/A'})</p>
            {hotelStarRating > 0 && (
              <p style={styles.hotelStars}>
                {hotelStarRating} Star Hotel
              </p>
            )}
          </div>

          <div style={styles.stayDetailsGrid}>
            <div style={styles.stayDetailColumn}>
              <p style={styles.stayDetailLabel}>Check-In</p>
              <p style={styles.stayDetailValue}>{formatDateWithDay(reservation.checkIn) || 'N/A'}</p>
              <p style={styles.stayDetailTime}>(15:00 - 19:00)</p>
            </div>
            <div style={styles.stayDetailColumn}>
              <p style={styles.stayDetailLabel}>Check-Out</p>
              <p style={styles.stayDetailValue}>{formatDateWithDay(reservation.checkOut) || 'N/A'}</p>
              <p style={styles.stayDetailTime}>(15:00 - 19:00)</p>
            </div>
            <div style={styles.stayDetailColumn}>
              <p style={styles.stayDetailLabel}>Room & Nights</p>
              <p style={styles.stayDetailValue}>{reservation.allRooms?.length || 0} room / {nights || 0} nights</p>
            </div>
          </div>

          <div style={styles.mapContainer}>
            <img 
              src={mapImageSrc || ''} // Use proxied map URL
              alt="Hotel Location" 
              style={styles.mapImage} 
              crossOrigin="anonymous" // Required for html2canvas
            />
            <div style={styles.mapOverlayCard}>
              <p style={styles.mapOverlayHotelName}>{hotel?.name || 'N/A'}</p>
              <p style={styles.mapOverlayAddress}>{hotel?.address?.fullAddress || 'N/A'}</p>
            </div>
          </div>

          <div style={styles.infoRowContainer}>
            <div
              style={{
                ...styles.guestInfoSection,
                flex: hasSpecialRequests ? 1 : '100%',
              }}
            >
              <h3 style={styles.guestInfoTitle}>Guest Information</h3>
              <p style={styles.guestNameAndNationality}>
                {leadPassenger.firstName} {leadPassenger.lastName} ({getCountryName(leadPassenger.nationality) || 'N/A'})
              </p>
              <div style={styles.guestCountLine}>
                <img src="/images/icons/user-3-line.png" alt="guests" style={styles.smallIcon} />
                <span>{totalGuests} Guests ({totalGuests} Adults)</span>
              </div>
            </div>

            {hasSpecialRequests && (
              <div style={styles.specialRequestsSection}>
                <h3 style={styles.specialRequestsTitle}>Special Requests</h3>
                <div style={styles.specialRequestsGrid}>
                  {reservation.specialRequests.map((request, index) => (
                    <div key={index} style={styles.specialRequestsGridItem}>
                      {request}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </main>

        <div style={styles.helpSection}>
          <h3 style={styles.helpTitle}>Need Help?</h3>
          <p style={styles.helpText}>For assistance with this booking, please contact our support team.</p>
        </div>

        {/* --- FOOTER MODIFIED --- */}
        <footer style={styles.footerNotes}>
          <img
            src="/images/nb.png" // This local image is fine
            alt="Important Notes"
            style={styles.footerImage}
          />
        </footer>

      </div>
    </div>
  );
};

// --- PDF GENERATION FUNCTION (MODIFIED) ---
export async function generateVoucherPDF(reservation: Reservation) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  // 1. Get Auth Token
  const match = document.cookie.match(/(?:^|; )authToken=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : null;

  // --- STEP 2: REMOVED ---
  // The API call to /auth/profile has been removed as requested.
  // Agency data will be read from the `reservation.agency` object.

  // 3. Fetch Hotel Details (For Geolocation, etc.)
  let geolocationData: { latitude: number; longitude: number } | null = null;
  let updatedHotelInfo = { ...reservation.hotelInfo };
  if (reservation.providerId && reservation.hotelInfo?.id) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      const wholesalerId = localStorage.getItem('wholesalerId');

      const response = await fetch(
        `${apiUrl}/hotel/${reservation.providerId}/${reservation.hotelInfo.id}`,
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

  // 4. Render component with all data
  const root = createRoot(container);
  await new Promise<void>((resolve) => {
    // --- MODIFICATION: Removed `agencyProfile` prop ---
    root.render(<VoucherTemplate reservation={reservationWithFullDetails} />);
    setTimeout(resolve, 200);
  });

  // Give images (especially proxied ones) time to load
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Increased delay for proxy

  // 5. Generate PDF (existing logic)
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
      useCORS: true, // This is crucial
      allowTaint: true, // May help in some cases
      backgroundColor: '#ffffff',
    },
    autoPaging: "none",
    x: 0,
    y: 0,
    width: componentWidth,
    windowWidth: componentWidth,
  });
}