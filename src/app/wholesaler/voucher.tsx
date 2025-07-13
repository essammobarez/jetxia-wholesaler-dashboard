import jsPDF from "jspdf";
import React from "react";
// @ts-ignore
import ReactDOM from "react-dom";

// Define the 'Reservation' type for clarity.
// In a real project, this would be in a separate types.ts file.
export interface Reservation {
  reservationId?: string;
  bookingId?: string;
  providerId?: string;
  checkIn?: string;
  checkOut?: string;
  passengers?: { firstName: string; lastName: string; lead?: boolean }[];
  hotelInfo?: {
    id?: string;
    name?: string;
  };
  cancellationPolicy?: {
    date?: string; // Top-level date for cancellation
    policies?: {
      date: string;
      charge: {
        value: number;
        currency: string;
      };
    }[];
  };
  // This is added based on the PDF generation logic
  geolocation?: {
    latitude: number;
    longitude: number;
  } | null;
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

const formatDateSimple = (dateStr: string | undefined) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatPolicyDate = (dateStr: string | undefined) => {
  if (!dateStr) return "an unknown date";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "an unknown date";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
    alignItems: "flex-start",
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
    width: 75,
    height: 75,
    marginRight: 12,
    marginTop: "5px",
  },
  companyDetails: {
    display: "flex",
    flexDirection: "column",
    marginTop: "1px",
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 1.1,
  },
  headerRight: {
    textAlign: "left",
    paddingTop: "0",
  },
  blueBar: {
    height: "10px",
    marginBottom: "8px",
    width: "100%",
    backgroundColor: "#0d6efd",
    marginTop: "30px",
  },
  voucherTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: "10px",
  },
  bookingDate: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },
  contactContainer: {
    display: "flex",
  },
  verticalLine: {
    width: "2px",
    backgroundColor: "#0d6efd",
    marginRight: "8px",
  },
  contactList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: 9,
    color: "#555",
  },
  contactItem: {
    marginBottom: 2,
  },
  contactLabel: {
    fontWeight: "bold",
    minWidth: "45px",
    display: "inline-block",
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
    alignItems: "center",
  },
  hotelImage: {
    width: 150,
    height: 100,
    objectFit: "cover",
    borderRadius: 4,
    marginRight: 12,
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
  hotelContactItem: {
    marginBottom: 4,
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
    gridTemplateColumns: "1.2fr 1fr",
    gap: 15,
    padding: "10px 0",
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
  importantText: {
    color: "red",
    fontWeight: "bold",
  },
  footer: {
    padding: "8px 20px",
    borderTop: "1px solid #eee",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 15,
    fontSize: 9,
  },
  finalNote: {
    borderTop: "1px solid #eee",
    marginTop: 8,
    paddingTop: 8,
    textAlign: "center",
    fontSize: 9,
    color: "#444",
  },
};

// --- REACT VOUCHER COMPONENT ---
export const VoucherTemplate: React.FC<{ reservation: Reservation }> = ({
  reservation,
}) => {
  const guest =
    reservation.passengers?.find((p) => p.lead) || reservation.passengers?.[0];

  const geolocation = reservation.geolocation || null;
  const mapImageSrc = geolocation
    ? `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${geolocation.longitude},${geolocation.latitude}&z=15&l=map&size=450,250&pt=${geolocation.longitude},${geolocation.latitude},pm2rdl`
    : "/images/map-placeholder.png";

  const hotelImageSrc = "/images/4.png";
  const checkInTime = "15:00 - 19:00";
  const checkOutTime = "15:00 - 19:00";
  const roomInfo = "1 room / 2 nights";
  const emergencyPhone = "+971 506942880";
  const importantInfo = `This property does not accommodate bachelorette or similar parties. License number: 10008287`;
  const hotelPolicies = `Free private parking is possible on site (reservation is not needed). No internet access available.`;
  const remark = `For any complaint during your hotel stay, please report immediately before you check out, else no complaints will be accepted.`;

  // Simplified cancellation logic as requested
  const cancellationDisplay = React.useMemo(() => {
    const policyDate = reservation.cancellationPolicy?.date;

    if (policyDate) {
      const penaltyStartDate = new Date(policyDate);
      const freeUntilDate = new Date(
        penaltyStartDate.getTime() - 24 * 60 * 60 * 1000
      );
      const formattedDate = formatPolicyDate(freeUntilDate.toISOString());

      return (
        <span>
          Free cancellation before <strong>{formattedDate}</strong>.
        </span>
      );
    }

    return null;
  }, [reservation.cancellationPolicy]);

  return (
    <div id="voucher-content" style={styles.voucherContainer}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.headerLeft}>
            <div style={styles.logoContainer}>
              <img
                src="/images/bdesk.jpg"
                alt="Logo"
                style={styles.logo}
                crossOrigin="anonymous"
              />
            </div>
            <div style={styles.companyDetails}>
              <span style={{ ...styles.companyName, marginTop: "-20px" }}>
                Booking Desk
              </span>
              <span style={{ ...styles.companyName, marginTop: "-1px" }}>
                Travel
              </span>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.blueBar}></div>
            <div style={styles.voucherTitle}>HOTEL VOUCHER</div>
            <div style={styles.bookingDate}>Booking date: 05-05-2025</div>
          </div>
        </div>
        <div style={styles.contactContainer}>
          <div style={styles.verticalLine}></div>
          <ul style={styles.contactList}>
            <li style={styles.contactItem}>
              <span style={styles.contactLabel}>Phone:</span> +971506942880
            </li>
            <li style={styles.contactItem}>
              <span style={styles.contactLabel}>Email:</span>{" "}
              ops@bdesktravel.com
            </li>
            <li style={styles.contactItem}>
              <span style={styles.contactLabel}>Address:</span> Zayed The First
              St, Al Hisn, 604 Abu Dhabi, 20037 United Arab Emirates
            </li>
          </ul>
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
                  {reservation.reservationId || "234324354353"}
                </span>
              </div>
              <div>
                <span style={styles.bookingInfoRefLabel}>Booking ID: </span>
                <span style={styles.bookingInfoRefValue}>
                  {reservation.bookingId || "234324354353"}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.bookingInfoBody}>
            <img
              src={hotelImageSrc}
              alt="Hotel"
              style={styles.hotelImage}
              crossOrigin="anonymous"
            />
            <div style={styles.hotelDetails}>
              <div style={styles.hotelName}>
                {reservation.hotelInfo?.name || "Golden Bujari Hospitality"}
              </div>
              <div style={styles.hotelContactItem}>
                <span>
                  Behind the Exhibitions Roundabout, Khamis Mushayt, 62432
                  Khamis, Saudi Arabia
                </span>
              </div>
              <div style={styles.hotelContactItem}>
                <span>Tel: +971506942880</span>
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
              <span>
                {guest
                  ? `${guest.firstName} ${guest.lastName}`.toUpperCase()
                  : "—"}
              </span>
            </div>

            <div style={{ marginTop: "10px" }}>
              <div style={styles.policyTitle}>Hotel Location Map</div>
              {geolocation ? (
                <img
                  src={mapImageSrc}
                  alt="Hotel Location Map"
                  style={styles.mapContainer}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={styles.policyText}>Map not available.</div>
              )}
            </div>
          </div>
          <div style={styles.policyText}>
            <div style={{ marginBottom: 10 }}>
              <div style={styles.policyTitle}>Cancellation Policy:</div>
              <div>{cancellationDisplay}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={styles.policyTitle}>Important Information</div>
              <div>{importantInfo}</div>
            </div>
            <div>
              <div style={styles.policyTitle}>Hotel Policies</div>
              <div>{hotelPolicies}</div>
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <div style={styles.policyTitle}>Need Help?</div>
            <div>
              If you cannot allocate this booking please call: Emergency phone :
              (+971) 506942880
            </div>
          </div>
          <div>
            <div style={styles.policyTitle}>Remark:</div>
            <div>
              For any complaint during your hotel stay, please report
              immediately before you check out, else no complaints will be
              accepted.
            </div>
          </div>
        </div>
        <div style={styles.finalNote}>
          N.B: IN CASE YOU ARE ACCOMMODATED LESS OVERNIGHTS, PLEASE MAKE SURE
          THAT HOTELIER HAS PROPERLY SIGNED AND ACCEPTED THIS MODIFICATION. WE
          CONFIRM THE AMENDMENT AND WILL INVOICE AS FOLLOWS: NUMBER OF NIGHTS
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
        }
      }
    } catch (error) {
      console.error("Failed to fetch hotel details:", error);
    }
  }

  const reservationWithGeolocation = {
    ...reservation,
    geolocation: geolocationData,
  };

  await new Promise<void>((resolve) => {
    ReactDOM.render(
      <VoucherTemplate reservation={reservationWithGeolocation} />,
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
