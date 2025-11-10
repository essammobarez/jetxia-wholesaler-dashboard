import jsPDF from "jspdf";
import ReactDOMServer from 'react-dom/server';
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
// Updated import to match your module structure
import { PackageRequest, ApiPackageBooking } from '../PackageRequestsModule';

// --- Updated Interface to work with PackageRequest ---
interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    request: PackageRequest;
}

// --- Helper functions (keep as is) ---
const getIconDataUrl = (IconComponent: React.ComponentType<any>, options = { color: 'black', size: 24 }): Promise<string> => {
    return new Promise((resolve, reject) => {
        const svgString = ReactDOMServer.renderToStaticMarkup(
            <IconComponent color={options.color} size={options.size} />
        );

        const img = new Image();
        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svg);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = options.size;
            canvas.height = options.size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                URL.revokeObjectURL(url);
                resolve(dataURL);
            } else {
                reject(new Error("Could not get canvas context"));
            }
        };

        img.onerror = reject;
        img.src = url;
    });
};

const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function numberToWords(num: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",];
    if (num === 0) return "Zero";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return (ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : ""));
    if (num < 10000) return (ones[Math.floor(num / 1000)] + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : ""));
    return num.toString();
}

export const generateInvoicePDF = async (data: InvoiceData): Promise<void> => {
    const phoneIcon = await getIconDataUrl(FaPhone, { color: 'black', size: 24 });
    const emailIcon = await getIconDataUrl(FaEnvelope, { color: 'black', size: 24 });
    const locationIcon = await getIconDataUrl(FaMapMarkerAlt, { color: 'black', size: 24 });

    const { invoiceNumber, invoiceDate, dueDate, request } = data;
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 12;

    // --- MAPPING DATA FROM PACKAGE REQUEST ---
    // Use rawData to access specific API fields if necessary, or request for generalized ones.
    const rawBooking = request.rawData as ApiPackageBooking;

    // Price mapping from your new response format
    const SP = request.pricing.totalPrice || 0;

    // Wholesaler Data Mapping (Safe fallbacks as it might be just an ID string in rawData)
    // Assuming rawBooking.wholesalerId might be an object if populated, else use placeholders
    const wholesaler = typeof rawBooking.wholesalerId === 'object' ? rawBooking.wholesalerId : null;
    const wholesalerName = wholesaler?.wholesalerName || "Wholesaler Name";
    const wholesalerPhone = wholesaler?.phoneNumber || "No Phone";
    const wholesalerEmail = wholesaler?.email || "No Email";
    const wholesalerAddress = wholesaler?.address || "No Address";
    const wholesalerLogo = wholesaler?.logo;

    // Agency mapping for "Billed To"
    // rawBooking.agencyId is an object in your example: { _id: "...", agencyName: "UIX" }
    const agencyName = (rawBooking.agencyId as any)?.agencyName || "Agency Name";

    const topMargin = 9;
    const logoX = margin;
    const logoY = topMargin - 6;
    const logoW = 40;
    const logoH = 40;

    // --- LOGO SECTION ---
    try {
        if (!wholesalerLogo) {
             throw new Error("Wholesaler logo URL is missing");
        }
        // Using proxy if needed, or direct URL if CORS allows
        const proxiedLogoUrl = `/api/proxy?url=${encodeURIComponent(wholesalerLogo)}`;
        const response = await fetch(proxiedLogoUrl);

        if (response.ok) {
            const imgBlob = await response.blob();
            const reader = new FileReader();
            await new Promise<void>((resolve, reject) => {
                reader.onload = (e) => {
                    const logoBase64 = e.target?.result as string;
                    const format = wholesalerLogo.endsWith(".png") ? "PNG" : "JPEG";
                    pdf.addImage(logoBase64, format, logoX, logoY, logoW, logoH);
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(imgBlob);
            });
        } else {
             throw new Error('Image fetch failed');
        }
    } catch (error) {
        // Fallback placeholder
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(logoX, logoY, logoW, logoH, 'D');
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text("Logo", logoX + logoW / 2, logoY + logoH / 2, { align: 'center' });
    }

    // --- COMPANY NAME ---
    const textX = logoX + logoW + 5;
    const textY = logoY + 8 + 8;
    const companyNameText = wholesalerName;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(30, 30, 30);
    pdf.text(companyNameText, textX, textY);

    // Blue Bar
    const textWidth = pdf.getStringUnitWidth(companyNameText) * 22 / pdf.internal.scaleFactor;
    const barStartX = textX + textWidth + 5;
    const barEndX = pageW - margin;
    const barHeight = 3.5;
    const barY = textY - (barHeight / 2) - 2;
    const slantWidth = 8;

    pdf.setFillColor(36, 123, 241);
    pdf.rect(barStartX + slantWidth, barY, barEndX - (barStartX + slantWidth), barHeight, "F");
    pdf.triangle(barStartX, barY + barHeight, barStartX + slantWidth, barY, barStartX + slantWidth, barY + barHeight, "F");

    // --- CONTACT & INVOICE TITLE SECTION ---
    const contactSectionY = logoY + logoH + 5;
    pdf.setDrawColor(36, 123, 241);
    pdf.setLineWidth(1.5);
    pdf.line(margin, contactSectionY - 2, margin, contactSectionY + 19.5);

    const iconX = margin + 1.5 + 2;
    const contactTextX = iconX + 6;
    let currentContactY = contactSectionY + 1.5;
    const iconSize = 3.5;
    const iconYOffset = -1.5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);

    // Phone
    pdf.addImage(phoneIcon, 'PNG', iconX, currentContactY - (iconSize / 2) + iconYOffset, iconSize, iconSize);
    pdf.text(wholesalerPhone, contactTextX, currentContactY);
    currentContactY += 7;

    // Email
    pdf.addImage(emailIcon, 'PNG', iconX, currentContactY - (iconSize / 2) + iconYOffset, iconSize, iconSize);
    pdf.text(wholesalerEmail, contactTextX, currentContactY);
    currentContactY += 7;

    // Address
    pdf.addImage(locationIcon, 'PNG', iconX, currentContactY - (iconSize / 2) + iconYOffset, iconSize, iconSize);
    const fullAddress = wholesalerAddress;
    let addressLine1 = fullAddress;
    let addressLine2 = "";
    const lastCommaIndex = fullAddress.lastIndexOf(',');
    if (lastCommaIndex > 0 && lastCommaIndex < fullAddress.length - 2) {
        addressLine1 = fullAddress.substring(0, lastCommaIndex).trim();
        addressLine2 = fullAddress.substring(lastCommaIndex + 1).trim();
    }
    pdf.text(addressLine1, contactTextX, currentContactY);
    if (addressLine2) {
         pdf.text(addressLine2, contactTextX, currentContactY + 4);
    }

    // TAX INVOICE title
    const titleX = pageW - margin;
    const titleY = contactSectionY + 8;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(32);
    pdf.setTextColor(30, 30, 30);
    pdf.text("TAX INVOICE", titleX, titleY, { align: "right" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Due Date ${dueDate}`, titleX, titleY + 8, { align: "right" });

    // --- BILLED TO & TOTAL AMOUNT SECTION ---
    const boxY = contactSectionY + 28;
    const billedToBoxW = 100;
    const billedToBoxH = 50;
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, boxY, billedToBoxW, billedToBoxH, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Billed To", margin + 5, boxY + 8);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.text(agencyName, margin + 5, boxY + 16); // Mapped Agency Name

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(margin + 5, boxY + 19, margin + billedToBoxW - 5, boxY + 19);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    let by = boxY + 25;
    const labelX = margin + 5;
    const colonX = margin + 45;
    const valueX = colonX + 3;

    const addBilledToLine = (label: string, value: string, yPos: number) => {
        pdf.text(label, labelX, yPos);
        pdf.text(":", colonX, yPos);
        pdf.text(value || "N/A", valueX, yPos);
        pdf.line(margin + 5, yPos + 2, margin + billedToBoxW - 5, yPos + 2);
    };

    addBilledToLine("Document No", invoiceNumber, by);
    by += 6;
    addBilledToLine("Invoice Date", invoiceDate, by);
    by += 6;
    addBilledToLine("Due Date", dueDate, by);
    by += 6;
    pdf.text("Tax Registration Number", labelX, by);
    pdf.text(":", colonX, by);
    pdf.text("104750328700003", valueX, by);

    // Total Amount Box
    const blueBoxY = boxY;
    const blueBoxW = 75;
    const blueBoxH = 20;
    const slant = 10;
    pdf.setFillColor(29, 70, 155);
    pdf.rect(pageW - margin - blueBoxW + slant, blueBoxY, blueBoxW - slant, blueBoxH, "F");
    pdf.triangle(pageW - margin - blueBoxW + slant, blueBoxY, pageW - margin - blueBoxW, blueBoxY + blueBoxH, pageW - margin - blueBoxW + slant, blueBoxY + blueBoxH, "F");

    const totalAmountTextY = blueBoxY + (blueBoxH / 2) + 3;
    const textStartX = pageW - margin - blueBoxW + slant + 5;
    const textEndX = pageW - margin - 5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Total Amount:", textStartX, totalAmountTextY);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(formatNumber(SP), textEndX, totalAmountTextY, { align: "right" });

    // --- INVOICE TABLE ---
    let tableY = boxY + 60;
    const tableStartX = margin;
    const tableWidth = pageW - (margin * 2);
    const headers = ["SL NO", "Package / Service", "Service Details", "Fare", "Service Fee", "VAT", "Amount"];
    const colWidths = [15, 40, 40, 23, 30, 18, 20];
    let colX = [tableStartX];
    for (let i = 0; i < colWidths.length; i++) {
        colX.push(colX[i] + colWidths[i]);
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(30, 30, 30);
    const headerHeight = 8;
    pdf.rect(tableStartX, tableY, tableWidth, headerHeight, "S");
    headers.forEach((h, i) => {
        pdf.text(h, colX[i] + 2, tableY + 5);
        if (i < headers.length) {
            pdf.line(colX[i], tableY, colX[i], tableY + headerHeight);
        }
    });
    tableY += headerHeight;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(30, 30, 30);

    // --- ROW DATA MAPPING ---
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return "N/A";
        }
    };

    // Package Title and Dates
    const packageTitle = request.package.title;
    const travelStart = formatDate(request.package.startDate);
    const travelEnd = formatDate(request.package.endDate);

    const ticketDetails = `${packageTitle}\nStart: ${travelStart}\nEnd: ${travelEnd}`;
    const serviceDetails = `Guest: ${request.customer.name}\nDestination: ${request.package.destination}`;

    const ticketDim = pdf.getTextDimensions(ticketDetails, { maxWidth: colWidths[1] - 4, fontSize: 9.5 });
    const serviceDim = pdf.getTextDimensions(serviceDetails, { maxWidth: colWidths[2] - 4, fontSize: 9.5 });
    const rowHeight = Math.max(ticketDim.h, serviceDim.h) + 4;

    pdf.rect(tableStartX, tableY, tableWidth, rowHeight, "S");
    for (let i = 1; i < colX.length; i++) {
        pdf.line(colX[i], tableY, colX[i], tableY + rowHeight);
    }

    const rowTextY = tableY + 4;
    pdf.text("1", colX[0] + 2, rowTextY);
    pdf.text(ticketDetails, colX[1] + 2, rowTextY, { maxWidth: colWidths[1] - 4 });
    pdf.text(serviceDetails, colX[2] + 2, rowTextY, { maxWidth: colWidths[2] - 4 });
    pdf.text(formatNumber(SP), colX[3] + 2, rowTextY);
    pdf.text("0.00", colX[4] + 2, rowTextY);
    pdf.text("0.00 (0%)", colX[5] + 2, rowTextY);
    pdf.setFont("helvetica", "bold");
    pdf.text(formatNumber(SP), colX[6] + 2, rowTextY);

    tableY += rowHeight;

    // --- SUMMARY & TOTALS ---
    let summaryY = tableY + 8;
    const summaryLineHeight = 6;
    const rightSideX = pageW - margin;
    const summaryLabelColX = rightSideX - 40;
    const summaryColonColX = rightSideX - 35;
    const summaryValueColX = rightSideX;

    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, summaryY - 2, rightSideX, summaryY - 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Invoice Total In Words", margin, summaryY + 4);
    pdf.setFont("helvetica", "bold");

    const dollars = Math.floor(SP);
    const cents = Math.round((SP - dollars) * 100);
    const dollarWords = numberToWords(dollars);
    const centWords = cents > 0 ? numberToWords(cents) : "";
    let amountInWords = "USD ";
    if (dollars > 0 && cents > 0) amountInWords += `${dollarWords} and ${centWords} Cents`;
    else if (dollars > 0) amountInWords += `${dollarWords}`;
    else if (cents > 0) amountInWords += `${centWords} Cents`;
    else amountInWords += "Zero";
    amountInWords += " Only";
    pdf.text(amountInWords, margin, summaryY + 10);

    let totalsY = summaryY + 4;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const addTotalLine = (label: string, value: string, yPos: number) => {
        pdf.text(label, summaryLabelColX, yPos);
        pdf.text(":", summaryColonColX, yPos, { align: "center" });
        pdf.text(value, summaryValueColX, yPos, { align: "right" });
    };
    addTotalLine("Total Before VAT", formatNumber(SP), totalsY);
    totalsY += summaryLineHeight;
    addTotalLine("VAT", formatNumber(0), totalsY);
    totalsY += summaryLineHeight;
    addTotalLine("Total", formatNumber(SP), totalsY);
    totalsY += 2;
    pdf.line(summaryLabelColX, totalsY, summaryValueColX, totalsY);
    totalsY += summaryLineHeight;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Net Amount ", summaryLabelColX - 5, totalsY);
    pdf.text(":", summaryColonColX, totalsY, { align: "center" });
    pdf.text(formatNumber(SP), summaryValueColX, totalsY, { align: "right" });

    const summaryHeight = totalsY - summaryY + 4;
    pdf.line(margin, summaryY + summaryHeight, rightSideX, summaryY + summaryHeight);

    let footerY = summaryY + summaryHeight + 20;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Manager", margin + 10, footerY);
    pdf.text("Accountant", margin + 60, footerY);
    pdf.text("Prepared By", margin + 120, footerY);

    pdf.save(`Invoice_${invoiceNumber}.pdf`);
};

export const generateInvoiceNumber = (): string => {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `INV${random}`;
}