import jsPDF from "jspdf";
import React from "react";
// @ts-ignore
import ReactDOM from "react-dom";
import { byIso } from 'country-code-lookup';

// Define the 'Reservation' type for clarity.
export interface Reservation {
  reservationId?: string;
  bookingId?: string;
  providerId?: string;
  checkIn?: string;
  checkOut?: string;
  passengers?: { firstName: string; lastName: string; lead?: boolean; nationality?: string }[];
  hotelInfo?: {
    id?: string;
    name?: string;
    address?: {
      fullAddress?: string;
      city?: string;
      countryCode?: string;
    };
  };
  cancellationPolicy?: {
    date?: string;
    policies?: {
      date: string;
      charge: {
        value: number;
        currency: string;
      };
    }[];
  };
  geolocation?: {
    latitude: number;
    longitude: number;
  } | null;
  allRooms?: any[];
}

// --- HELPER FUNCTIONS ---
const formatDateDetailed = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
};

const getCountryName = (code: string | undefined): string => {
  if (!code) return "";
  const country = byIso(code);
  return country ? country.country : code;
};


// --- STYLES OBJECT ---
const styles: { [key: string]: React.CSSProperties } = {
  voucherContainer: {
    fontFamily: "Arial, sans-serif",
    width: 595,
    background: "#fff",
    color: "#333",
    fontSize: 10,
    border: "1px solid #eee",
    boxSizing: "border-box",
  },
  header: {
    padding: "10px 20px",
    display: "flex",
    flexDirection: "column",
    borderBottom: "1px solid #eee",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "10px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    width: 85,
    height: 60,
    marginRight: 12,
  },
  headerCenter: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -15,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  agencyLogo: {
    width: 75,
    height: "auto",
  },
  voucherTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    padding: "10px 20px",
  },
  bookingInfoSection: {
    border: "1px solid #e0e0e0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  bookingInfoHeader: {
    padding: "6px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eaf2fd",
  },
  bookingInfoTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  bookingInfoReferences: {
    textAlign: "right",
    fontSize: 10,
  },
  bookingInfoRefLabel: {
    color: "#555",
  },
  bookingInfoRefValue: {
    color: "#0d6efd",
    fontWeight: "bold",
  },
  bookingInfoBody: {
    display: "flex",
    padding: "10px 12px",
    alignItems: "flex-start",
  },
  hotelDetails: {
    fontSize: 10,
    color: "#555",
  },
  hotelName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  roomInfoItem: {
    fontSize: 10,
    color: '#333',
    marginTop: 5,
    paddingLeft: 10,
    borderLeft: '2px solid #eaf2fd',
  },
  roomNameText: {
    fontWeight: 'bold',
  },
  roomBoardText: {
    fontSize: 9,
    color: '#555',
    fontWeight: 'normal',
    display: 'block',
  },
  hotelContactItem: {
    marginBottom: 4,
    marginTop: 8,
  },
  dashedSeparator: {
    borderBottom: "1px dashed #e0e0e0",
    margin: "0 12px",
  },
  checkInOutContainer: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 12px",
  },
  checkInOutBox: {
    textAlign: "center",
  },
  checkLabel: {
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 12,
  },
  checkValue: {
    color: "#555",
    fontSize: 10,
  },
  guestPolicyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: 15,
    padding: "10px 0",
    alignItems: "center",
  },
  guestInfo: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
  },
  mapContainer: {
    width: "100%",
    height: 140,
    borderRadius: 4,
    border: "1px solid #ddd",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "block",
  },
  policyText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  policyTitle: {
    fontWeight: "bold",
    marginBottom: 3,
    fontSize: 11,
  },
  footer: {
    padding: "8px 20px",
    borderTop: "1px solid #eee",
  },
  finalNote: {
    borderTop: "1px solid #eee",
    marginTop: 8,
    paddingTop: 8,
    textAlign: "center",
    fontSize: 9,
    color: "#444",
    fontWeight: "bold",
  },
};

// --- REACT VOUCHER COMPONENT ---
export const VoucherTemplate: React.FC<{ reservation: Reservation }> = ({
  reservation,
}) => {
  const geolocation = reservation.geolocation || null;
  const mapImageSrc = geolocation
    ? `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${geolocation.longitude},${geolocation.latitude}&z=15&l=map&size=450,250&pt=${geolocation.longitude},${geolocation.latitude},pm2rdl`
    : "/images/map-placeholder.png";

  const mapDirectionsUrl = geolocation
    ? `http://googleusercontent.com/maps/google.com/2{geolocation.latitude},${geolocation.longitude}`
    : "#";

  const checkInTime = "15:00 - 19:00";
  const checkOutTime = "15:00 - 19:00";

  const calculateNights = (
    checkInStr?: string,
    checkOutStr?: string
  ): number => {
    if (!checkInStr || !checkOutStr) return 0;
    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return 0;

    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const numberOfNights = calculateNights(
    reservation.checkIn,
    reservation.checkOut
  );
  
  const numberOfRooms = reservation.allRooms?.length || 1;
  const roomInfo = `${numberOfRooms} room${numberOfRooms > 1 ? 's' : ''} / ${numberOfNights} nights`;

  return (
    <div id="voucher-content" style={styles.voucherContainer}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.headerLeft}>
            <div style={styles.logoContainer}>
              <img
                src="/images/new-logo.jpeg"
                alt="Logo"
                style={styles.logo}
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <div style={styles.headerCenter}>
            <div style={styles.voucherTitle}>HOTEL VOUCHER</div>
          </div>
          <div style={styles.headerRight}>
            <img
              src="/images/agency-logo.png"
              alt="Agency Logo"
              style={styles.agencyLogo}
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </header>

      <main style={styles.body}>
        <section style={styles.bookingInfoSection}>
          <div style={styles.bookingInfoHeader}>
            <div style={styles.bookingInfoTitle}>Booking Information</div>
            <div style={styles.bookingInfoReferences}>
              <div>
                <span style={styles.bookingInfoRefLabel}>Reference: </span>
                <span style={styles.bookingInfoRefValue}>
                  {reservation.reservationId || "N/A"}
                </span>
              </div>
              <div>
                <span style={styles.bookingInfoRefLabel}>Booking ID: </span>
                <span style={styles.bookingInfoRefValue}>
                  {reservation.bookingId || "N/A"}
                </span>
              </div>
               {/* --- MODIFIED: Booking date moved here --- */}
              <div>
                <span style={styles.bookingInfoRefLabel}>Booking date: </span>
                <span style={styles.bookingInfoRefValue}>
                  {new Date().toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.bookingInfoBody}>
            <div style={styles.hotelDetails}>
              <div style={styles.hotelName}>
                {reservation.hotelInfo?.name || "Hotel Name Not Available"}
              </div>

              {reservation.allRooms && reservation.allRooms.length > 0 && reservation.allRooms.map((room, index) => (
                <div key={index} style={styles.roomInfoItem}>
                    <span style={styles.roomNameText}>{`Room ${index + 1}: ${room.roomName || 'N/A'}`}</span>
                    {(room.board && room.board !== 'N/A') && (
                        <span style={styles.roomBoardText}>{`(${room.board})`}</span>
                    )}
                </div>
              ))}
              
              <div style={styles.hotelContactItem}>
                <span>
                  {reservation.hotelInfo?.address?.fullAddress ||
                    "Address not available"}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.dashedSeparator}></div>

          <div style={styles.checkInOutContainer}>
            <div style={styles.checkInOutBox}>
              <div style={styles.checkLabel}>Check-In</div>
              <div style={styles.checkValue}>
                {formatDateDetailed(reservation.checkIn)}
              </div>
              <div style={styles.checkValue}>({checkInTime})</div>
            </div>
            <div style={styles.checkInOutBox}>
              <div style={styles.checkLabel}>Check-Out</div>
              <div style={styles.checkValue}>
                {formatDateDetailed(reservation.checkOut)}
              </div>
              <div style={styles.checkValue}>({checkOutTime})</div>
            </div>
            <div style={styles.checkInOutBox}>
              <div style={styles.checkLabel}>Room & Nights</div>
              <div style={styles.checkValue}>{roomInfo}</div>
            </div>
          </div>
        </section>

        <section style={styles.guestPolicyGrid}>
          <div>
            <div style={styles.sectionTitle}>Guest Information</div>
            <div style={styles.guestInfo}>
                {(reservation.passengers && reservation.passengers.length > 0) ? (
                    reservation.passengers.map((p, index) => (
                        <div key={index} style={{ marginBottom: '2px' }}>
                            {`${p.firstName} ${p.lastName}`.toUpperCase()}
                            {p.nationality && ` (${getCountryName(p.nationality)})`}
                        </div>
                    ))
                ) : (
                    <div>—</div>
                )}
            </div>
          </div>
          
          <div>
            <div style={{ ...styles.policyTitle, textAlign: "center", marginBottom: "10px" }}>
              Hotel Location Map
            </div>
            {geolocation ? (
              <a href={mapDirectionsUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={mapImageSrc}
                  alt="Hotel Location Map"
                  style={styles.mapContainer}
                  crossOrigin="anonymous"
                  title="Click to get directions"
                />
              </a>
            ) : (
              <div style={{...styles.policyText, textAlign: 'center'}}>Map not available.</div>
            )}
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={{ marginBottom: 8, fontSize: 9 }}>
          <div style={styles.policyTitle}>Need Help?</div>
          <div>
            For assistance with this booking, please contact our support team.
          </div>
        </div>
        <div style={styles.finalNote}>
          N.B: IN CASE YOU ARE ACCOMMODATED LESS OVERNIGHTS, PLEASE MAKE SURE
          THAT HOTELIER HAS PROPERLY SIGNED AND ACCEPTED THIS MODIFICATION. WE
          CONFIRM THE AMENDMENT AND WILL INVOICE AS FOLLOWS: NUMBER OF NIGHTS{" "}
          ______________ TO BE REFUNDED.
        </div>
      </footer>
    </div>
  );
};

// --- PDF GENERATION FUNCTION ---
export async function generateVoucherPDF(reservation: Reservation) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  let geolocationData: { latitude: number; longitude: number } | null = null;
  let updatedHotelInfo = { ...reservation.hotelInfo };

  if (reservation.providerId && reservation.hotelInfo?.id) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
      const response = await fetch(
        `${apiUrl}/hotel/${reservation.providerId}/${reservation.hotelInfo.id}`
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

  await new Promise<void>((resolve) => {
    ReactDOM.render(
      <VoucherTemplate reservation={reservationWithFullDetails} />,
      container,
      resolve
    );
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

  pdf.html(content, {
    callback: function (doc) {
      doc.save(`Hotel-Voucher-${reservation.bookingId || "booking"}.pdf`);
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
    },
    html2canvas: {
      scale: 1,
      useCORS: true,
    },
    autoPaging: "slice",
    x: 0,
    y: 0,
    width: 595.28,
    windowWidth: 595,
  });
}