"use client";

import jsPDF from "jspdf";
import {
  AlertCircle,
  Building,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Search,
  TrendingDown,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// API Response Interfaces (as provided)
interface ApiBookingResponse {
  modificationDetails?: {
    modifiedAt: string;
  };
  _id: string;
  bookingId: string;
  sequenceNumber: number;
  reservationId: number;
  bookingData: {
    initialResponse?: {
      id: number;
      clientRef: string;
      type: string;
      status: string;
      reference: {
        external: string;
        confirmation: string | null;
      };
      price: {
        selling: {
          value: number;
          currency: string;
        };
      };
      added: {
        time: string;
        user: {
          module: string;
          id: number;
          username: string;
          name: string;
          email: string;
          telephone: string;
        };
        module: string;
      };
    };
    detailedInfo?: {
      id: number;
      clientRef: string;
      service: {
        type: string;
        status: string;
        payment: {
          status: string;
          type: string;
          deadline: string | null;
        };
        prices: {
          total: {
            selling: {
              value: number;
              currency: string;
            };
          };
        };
      };
      serviceDates?: {
        startDate: string;
        endDate: string;
      };
      reference?: {
        external: string;
        confirmation: string | null;
      };
      hotel?: {
        name: string;
      };
      passengers?: Array<{
        firstName: string;
        lastName: string;
        email: string;
      }>;
      added: {
        time: string;
      };
    };
  };
  provider: {
    _id: string;
    name: string;
  };
  agency: {
    _id: string;
    agencyName: string;
  };
  wholesaler: string;
  status: string;
  bookingType: string;
  paymentMethod: string | null;
  priceDetails?: {
    price: {
      value: number;
      currency: string;
    };
    originalPrice: {
      value: number;
      currency: string;
    };
    markupApplied?: {
      type: string;
      value: number;
      description: string;
    };
  };
  modified: boolean;
  createdAt: string;
  payments: any[];
  __v: number;
}

interface PaymentRecord {
  id: string;
  bookingId: string;
  agencyName: string;
  agencyId: string;
  customerName: string;
  amount: number;
  currency: string;
  paymentMethod: "credit_card" | "bank_transfer" | "cash" | "check" | "paypal";
  paymentStatus: "pending" | "completed" | "failed" | "refunded" | "partial";
  transactionId: string;
  paymentDate: string;
  dueDate: string;
  serviceType: string;
  clientRef: string;
  processingFee: number;
  netAmount: number;
  notes?: string;
  sequenceNumber: number;
}

// ====================================================================
// Helper function to convert number to words (Robust Version)
// ====================================================================
const numberToWords = (num: number): string => {
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const thousands = ["", "thousand", "million", "billion", "trillion"];

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return "";
    let word = "";
    if (n >= 100) {
      word += ones[Math.floor(n / 100)] + " hundred";
      n %= 100;
      if (n > 0) word += " ";
    }
    if (n >= 20) {
      word += tens[Math.floor(n / 10)];
      if (n % 10 > 0) word += " " + ones[n % 10];
    } else if (n >= 10) {
      word += teens[n - 10];
    } else if (n > 0) {
      word += ones[n];
    }
    return word;
  };

  if (typeof num !== "number") return "Invalid number";
  if (num === 0) return "Zero";

  const [integerPartStr, decimalPartStr] = num.toFixed(2).split(".");
  const integerPart = parseInt(integerPartStr, 10);
  const decimalPart = parseInt(decimalPartStr, 10);

  let integerWords = "";
  if (integerPart > 0) {
    let tempNum = integerPart;
    let i = 0;
    let parts = [];
    while (tempNum > 0) {
      const chunk = tempNum % 1000;
      if (chunk > 0) {
        const chunkWords = convertLessThanOneThousand(chunk);
        const scaleWord = thousands[i] ? " " + thousands[i] : "";
        parts.unshift(chunkWords + scaleWord);
      }
      tempNum = Math.floor(tempNum / 1000);
      i++;
    }
    integerWords = parts.join(", ");
  }

  let decimalWords = "";
  if (decimalPart > 0) {
    decimalWords = "and " + convertLessThanOneThousand(decimalPart) + " cents";
  }

  let fullWords = "";
  if (integerWords && decimalWords) {
    fullWords = `${integerWords} ${decimalWords}`;
  } else if (integerWords) {
    fullWords = `${integerWords} only`;
  } else if (decimalWords) {
    fullWords = `${decimalWords.substring(4)} only`;
  }

  const result = fullWords.charAt(0).toUpperCase() + fullWords.slice(1);
  return result.replace(/\s+/g, " ").trim();
};

const PaymentReport: React.FC = () => {
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<
    Array<{ id: string; agencyName: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfLoadingRecord, setPdfLoadingRecord] = useState<string | null>(null);

  // Dynamic wholesalerId from localStorage
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // Load stored wholesaler ID on mount
  useEffect(() => {
    const stored = localStorage.getItem("wholesalerId");
    setWholesalerId(stored);
  }, []);

  // ====================================================================
  // PDF Download Handler (UPDATED WITH REDUCED VERTICAL SPACING)
  // ====================================================================
  const handleDownloadVoucher = async (record: PaymentRecord) => {
    setPdfLoading(true);
    setPdfLoadingRecord(record.bookingId);
    setPdfProgress(0);

    try {
      const isRefunded = record.paymentStatus === "refunded";
      const receiptTitle = isRefunded ? "Refund Receipt" : "Payment Receipt";
      const receiveFromLabel = isRefunded ? "Refund To :" : "Receive From :";

      let beingOfText: string;
      if (isRefunded) {
        beingOfText = `REFUND TO ${record.agencyName.toUpperCase()} AS PER STATEMENT AMOUNT ${
          record.currency
        } ${record.amount.toFixed(2)}\nADDED IN WALLET`;
      } else if (record.paymentStatus === "completed") {
        beingOfText = `CASH RECEIVED FROM ${record.agencyName.toUpperCase()} AS PER STATEMENT AMOUNT ${
          record.currency
        } ${record.amount.toFixed(2)}`;
      } else {
        beingOfText = `PAYMENT FOR BOOKING ${
          record.bookingId
        } FROM ${record.agencyName.toUpperCase()}`;
      }

      setPdfProgress(10);
      const amountInWords = numberToWords(record.amount);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let y = 15;

      // --- 1. HERO SECTION ---
      setPdfProgress(20);

      // Logo
      const logoWidth = 30;
      const logoHeight = 30;
      const logoX = margin;
      const logoY = y;
      try {
        const response = await fetch("/images/bdesk.jpg");
        if (!response.ok) throw new Error("Logo not found");
        const imgBlob = await response.blob();
        const reader = new FileReader();

        await new Promise<void>((resolve, reject) => {
          reader.onload = (e) => {
            const logoBase64 = e.target?.result as string;
            pdf.addImage(
              logoBase64,
              "JPEG",
              logoX,
              logoY,
              logoWidth,
              logoHeight
            );
            resolve();
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(imgBlob);
        });
      } catch (e) {
        console.error("Could not load logo, using text fallback.", e);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text("Booking Desk", logoX, logoY + 10);
      }

      setPdfProgress(30);

      // Company Name & Blue Bar
      const textX = logoX + logoWidth + 5;
      const firstLineY = y + logoHeight / 2 - 4;
      const secondLineY = firstLineY + 8;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      const bookingDeskText = "Booking Desk";
      pdf.text(bookingDeskText, textX, firstLineY);

      const bookingDeskWidth =
        pdf.getStringUnitWidth(bookingDeskText) *
        (18 / pdf.internal.scaleFactor);

      const barHeight = 4;
      const barX = textX + bookingDeskWidth + 5;
      const barWidth = pageW - margin - barX;
      const barY = firstLineY - barHeight / 2 - 1.5;
      const slantAmount = 3;

      pdf.setFillColor(29, 119, 239);
      pdf.moveTo(barX, barY + barHeight);
      pdf.lineTo(barX + slantAmount, barY);
      pdf.lineTo(barX + barWidth, barY);
      pdf.lineTo(barX + barWidth, barY + barHeight);
      pdf.close();
      pdf.fill();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(18);
      pdf.text("Travel", textX, secondLineY);

      // Address with Vertical Line and Location Icon
      const addressY = y + logoHeight + 8;
      let currentX = margin;

      const blueLineWidth = 1.2;
      const blueLineHeight = 9;
      pdf.setFillColor(29, 119, 239);
      pdf.rect(currentX, addressY, blueLineWidth, blueLineHeight, "F");

      currentX += blueLineWidth + 1.5;

      const iconSize = 4.5;
      const iconX = currentX;
      const iconY = addressY;
      const headRadius = iconSize / 2.5;
      const bodyTopY = iconY + headRadius;
      const pointY = iconY + iconSize;
      const headCenterX = iconX + iconSize / 2;
      const headCenterY = iconY + headRadius;

      pdf.setFillColor(80, 80, 80);
      pdf.triangle(
        iconX,
        bodyTopY,
        iconX + iconSize,
        bodyTopY,
        headCenterX,
        pointY,
        "F"
      );
      pdf.circle(headCenterX, headCenterY, headRadius, "F");
      pdf.setFillColor(255, 255, 255);
      pdf.circle(headCenterX, headCenterY, headRadius / 2, "F");

      currentX += iconSize + 2;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const addressText =
        "Zayed The First St, Al Hisn, 604 Abu Dhabi, \n20037 United Arab Emirates";
      const addressLines = pdf.splitTextToSize(
        addressText,
        pageW - margin - currentX
      );
      pdf.text(addressLines, currentX, addressY + 4);

      // Receipt Title (Dynamic)
      const titleY = y + 25;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(0, 0, 0);
      pdf.text(receiptTitle, pageW - margin, titleY, { align: "right" });

      // Approval Date
      const dateY = titleY + 7;
      const approvalDate = record.paymentDate
        ? new Date(record.paymentDate).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "N/A";
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Approval Date : ${approvalDate}`, pageW - margin, dateY, {
        align: "right",
      });

      y = addressY + 15; // REDUCED from 18

      // --- 2. TOP BORDER LINE ---
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, y, pageW - margin, y);
      y += 8; // REDUCED from 10
      setPdfProgress(50);

      // --- 3. DETAILS BOXES ---
      const boxHeight = 11;
      const boxY = y;
      const textBaseline: "middle" = "middle";
      const padding = 4;

      const noBoxWidth = 35;
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(200, 200, 200);
      pdf.roundedRect(margin, boxY, noBoxWidth, boxHeight, 2, 2, "S");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text("No:", margin + padding, boxY + boxHeight / 2, {
        baseline: textBaseline,
      });

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      const noText = `${record.sequenceNumber}`;
      const noLabelWidth =
        pdf.getStringUnitWidth("No:") * (10 / pdf.internal.scaleFactor);
      const noTextX = margin + padding + noLabelWidth + 2;
      pdf.text(noText, noTextX, boxY + boxHeight / 2, {
        baseline: textBaseline,
      });

      const amountBoxX = margin + noBoxWidth + 5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      const amountLabelText = `Amount In ${record.currency.toUpperCase()}:`;

      const amountLabelWidth =
        pdf.getStringUnitWidth(amountLabelText) *
        (10 / pdf.internal.scaleFactor);

      pdf.setFont("helvetica", "bold");
      const amountValueText = `${record.amount.toFixed(2)}`;
      const amountValueWidth =
        pdf.getStringUnitWidth(amountValueText) *
        (10 / pdf.internal.scaleFactor);

      const amountBoxWidth = amountLabelWidth + amountValueWidth + padding * 3;

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(amountBoxX, boxY, amountBoxWidth, boxHeight, 2, 2, "S");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(amountLabelText, amountBoxX + padding, boxY + boxHeight / 2, {
        baseline: textBaseline,
      });

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      const amountTextX = amountBoxX + padding + amountLabelWidth + padding;
      pdf.text(amountValueText, amountTextX, boxY + boxHeight / 2, {
        baseline: textBaseline,
      });

      y = boxY + boxHeight + 12; // REDUCED from 15
      setPdfProgress(65);

      // --- 4. MAIN CONTENT SECTION ---
      const drawField = (
        label: string,
        value: string,
        startY: number
      ): number => {
        const valueX = margin + 45;
        const valueWidth = pageW - margin - valueX;
        const textY = startY + 3;
        const dotStyle = { color: 150, width: 0.5, dash: [0.5, 0.5] };

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        pdf.text(label, margin, textY, { baseline: "middle" });

        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0);
        const valueLines = pdf.splitTextToSize(value, valueWidth);
        const lineHeight = 7; // REDUCED from 8

        valueLines.forEach((line: string, index: number) => {
          const currentTextY = textY + index * lineHeight;
          pdf.text(line, valueX, currentTextY, { baseline: "middle" });

          const lineY = currentTextY + 3;
          pdf.setLineDashPattern(dotStyle.dash, 0);
          pdf.setDrawColor(dotStyle.color);
          pdf.setLineWidth(dotStyle.width);
          pdf.line(valueX, lineY, pageW - margin, lineY);
          pdf.setLineDashPattern([], 0);
        });

        return startY + valueLines.length * lineHeight + 2; // REDUCED spacing from 4
      };

      y = drawField(receiveFromLabel, record.agencyName.toUpperCase(), y);
      y = drawField("Amount In Words :", amountInWords, y);
      y = drawField("Being Of :", beingOfText, y);

      y += 20; // REDUCED from 25
      setPdfProgress(85);

      // --- 5. SIGNATURES ---
      const sigLineY = y;
      const sigLineWidth = 60;
      const dotStyle = { color: 150, width: 0.5, dash: [0.5, 0.5] };

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);

      const cashierLabel = "Cashier Sign";
      pdf.text(cashierLabel, margin, sigLineY, { baseline: "middle" });

      const cashierLabelWidth =
        pdf.getStringUnitWidth(cashierLabel) * (10 / pdf.internal.scaleFactor);
      const cashierLineX = margin + cashierLabelWidth + 3;
      pdf.setLineDashPattern(dotStyle.dash, 0);
      pdf.setDrawColor(dotStyle.color);
      pdf.setLineWidth(dotStyle.width);
      pdf.line(cashierLineX, sigLineY, cashierLineX + sigLineWidth, sigLineY);

      const customerLabel = "Customer Sign";
      const customerLabelWidth =
        pdf.getStringUnitWidth(customerLabel) * (10 / pdf.internal.scaleFactor);
      const customerSigX =
        pageW - margin - sigLineWidth - customerLabelWidth - 3;
      pdf.text(customerLabel, customerSigX, sigLineY, { baseline: "middle" });

      const customerLineX = customerSigX + customerLabelWidth + 3;
      pdf.line(customerLineX, sigLineY, customerLineX + sigLineWidth, sigLineY);

      setPdfProgress(95);
      pdf.setLineDashPattern([], 0);
      pdf.save(`PaymentReceipt-${record.bookingId}.pdf`);
      setPdfProgress(100);

      setTimeout(() => {
        setPdfLoading(false);
        setPdfLoadingRecord(null);
        setPdfProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfLoading(false);
      setPdfLoadingRecord(null);
      setPdfProgress(0);
    }
  };

  const transformApiDataToPaymentRecords = (
    apiData: ApiBookingResponse[]
  ): PaymentRecord[] => {
    return apiData.map((booking, index) => {
      const currency =
        booking.priceDetails?.price?.currency ||
        booking.bookingData?.initialResponse?.price?.selling?.currency ||
        "USD";
      const amount =
        booking.priceDetails?.price?.value ||
        booking.bookingData?.initialResponse?.price?.selling?.value ||
        0;

      let paymentStatus:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "partial" = "pending";
      if (booking.status === "confirmed") paymentStatus = "completed";
      else if (booking.status === "cancelled") paymentStatus = "refunded";
      else if (booking.status === "failed") paymentStatus = "failed";

      let paymentMethod:
        | "credit_card"
        | "bank_transfer"
        | "cash"
        | "check"
        | "paypal" = "credit_card";
      if (booking.paymentMethod) {
        switch (booking.paymentMethod.toLowerCase()) {
          case "bank_transfer":
          case "transfer":
            paymentMethod = "bank_transfer";
            break;
          case "cash":
            paymentMethod = "cash";
            break;
          case "check":
            paymentMethod = "check";
            break;
          case "paypal":
            paymentMethod = "paypal";
            break;
          default:
            paymentMethod = "credit_card";
        }
      }

      const leadPassenger = booking.bookingData?.detailedInfo?.passengers?.find(
        (p) => p.firstName && p.lastName
      );
      const customerName = leadPassenger
        ? `${leadPassenger.firstName} ${leadPassenger.lastName}`
        : "Customer";
      const processingFee = 0;
      const netAmount = amount;
      const dueDate =
        booking.bookingData?.detailedInfo?.service?.payment?.deadline ||
        booking.bookingData?.detailedInfo?.serviceDates?.startDate ||
        booking.createdAt;
      const paymentDate =
        paymentStatus === "completed"
          ? booking.createdAt
          : new Date().toISOString(); // Use current date for non-completed for example
      const transactionId = `TXN-${booking.bookingId}-${Date.now()}`;
      const serviceType =
        booking.bookingData?.detailedInfo?.service?.type?.toUpperCase() ||
        "SERVICE";
      const clientRef =
        booking.bookingData?.initialResponse?.clientRef ||
        booking.bookingData?.detailedInfo?.reference?.external ||
        booking.bookingId;

      let notes = "";
      if (paymentStatus === "completed")
        notes = "Payment processed successfully";
      else if (paymentStatus === "pending")
        notes = "Awaiting payment confirmation";
      else if (paymentStatus === "failed") notes = "Payment processing failed";
      else if (paymentStatus === "refunded")
        notes = "Payment refunded due to cancellation";

      return {
        id: booking._id,
        bookingId: booking.bookingId,
        agencyName: booking.agency?.agencyName || "Unknown Agency",
        agencyId: booking.agency?._id || "unknown",
        customerName: customerName,
        amount: amount,
        currency: currency,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        transactionId: transactionId,
        paymentDate: paymentDate,
        dueDate: dueDate,
        serviceType: serviceType,
        clientRef: clientRef,
        processingFee: processingFee,
        netAmount: netAmount,
        notes: notes,
        sequenceNumber: booking.sequenceNumber || index + 1,
      };
    });
  };

  // Fetch real data from API
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!wholesalerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
        const response = await fetch(
          `${apiUrl}booking/wholesaler/${wholesalerId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData: ApiBookingResponse[] = await response.json();
        if (!Array.isArray(apiData)) {
          throw new Error("Invalid API response format");
        }
        const validBookings = apiData.filter(
          (booking) =>
            booking &&
            booking._id &&
            booking.bookingId &&
            booking.agency &&
            booking.agency._id &&
            booking.agency.agencyName
        );
        if (validBookings.length === 0) {
          setPaymentRecords([]);
          setFilteredRecords([]);
        } else {
          const transformedRecords =
            transformApiDataToPaymentRecords(validBookings);
          const uniqueAgencies = Array.from(
            new Map(
              validBookings.map((booking) => [
                booking.agency._id,
                {
                  id: booking.agency._id,
                  agencyName: booking.agency.agencyName,
                },
              ])
            ).values()
          );
          setAgencies(uniqueAgencies);
          setPaymentRecords(transformedRecords);
          setFilteredRecords(transformedRecords);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
        setPaymentRecords([]);
        setFilteredRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, [wholesalerId]);

  // Filter records based on search and filters
  useEffect(() => {
    let filtered = paymentRecords.filter((record) => {
      const matchesSearch =
        record.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.clientRef.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAgency =
        selectedAgency === "all" || record.agencyId === selectedAgency;
      const matchesStatus =
        statusFilter === "all" || record.paymentStatus === statusFilter;
      const matchesMethod =
        methodFilter === "all" || record.paymentMethod === methodFilter;
      let matchesDate = true;
      if (dateRange.from && dateRange.to && record.paymentDate) {
        const recordDate = new Date(record.paymentDate);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        matchesDate = recordDate >= fromDate && recordDate <= toDate;
      }
      return (
        matchesSearch &&
        matchesAgency &&
        matchesStatus &&
        matchesMethod &&
        matchesDate
      );
    });
    setFilteredRecords(filtered);
  }, [
    paymentRecords,
    searchTerm,
    selectedAgency,
    statusFilter,
    methodFilter,
    dateRange,
  ]);

  // UI Helper functions (getStatusColor, etc.)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "failed":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "refunded":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "partial":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <TrendingDown className="w-4 h-4" />;
      case "partial":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="w-4 h-4" />;
      case "bank_transfer":
        return <Building className="w-4 h-4" />;
      case "paypal":
        return <DollarSign className="w-4 h-4" />;
      case "cash":
        return <DollarSign className="w-4 h-4" />;
      case "check":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatMethodName = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const totalAmount = filteredRecords.reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const completedAmount = filteredRecords
    .filter((r) => r.paymentStatus === "completed")
    .reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = filteredRecords
    .filter((r) => r.paymentStatus === "pending")
    .reduce((sum, record) => sum + record.amount, 0);
  const failedAmount = filteredRecords
    .filter((r) => r.paymentStatus === "failed")
    .reduce((sum, record) => sum + record.amount, 0);

  const exportToCSV = () => {
    const headers = [
      "Booking ID",
      "Agency Name",
      "Customer Name",
      "Amount",
      "Currency",
      "Payment Method",
      "Payment Status",
      "Transaction ID",
      "Payment Date",
      "Due Date",
      "Service Type",
      "Client Ref",
      "Notes",
    ];
    const csvData = filteredRecords.map((record) => [
      record.bookingId,
      record.agencyName,
      record.customerName,
      record.amount,
      record.currency,
      formatMethodName(record.paymentMethod),
      record.paymentStatus,
      record.transactionId,
      record.paymentDate
        ? new Date(record.paymentDate).toLocaleDateString()
        : "",
      new Date(record.dueDate).toLocaleDateString(),
      record.serviceType,
      record.clientRef,
      record.notes || "",
    ]);
    const csvContent = [headers, ...csvData]
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Styles for advanced responsive table */}
      <style jsx global>{`
        @media (max-width: 767px) {
          /* Hide table header on mobile */
          .responsive-table thead {
            display: none;
          }
          /* Make table and rows block elements */
          .responsive-table tbody,
          .responsive-table tr {
            display: block;
          }
          /* Style each row as a card */
          .responsive-table tr {
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            display: block;
            margin-bottom: 1rem;
            padding: 1rem;
            position: relative;
          }
          .dark .responsive-table tr {
            background-color: #1f2937;
            border-color: #374151;
          }
          /* Style each cell */
          .responsive-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .dark .responsive-table td {
            border-color: #374151;
          }
          /* No border for the last cell in the card */
          .responsive-table td:last-of-type {
            border-bottom: none;
          }
          /* Add data labels before each cell */
          .responsive-table td[data-label]::before {
            content: attr(data-label);
            font-weight: 600;
            color: #4b5563;
            margin-right: 1rem;
            text-align: left;
          }
          .dark .responsive-table td[data-label]::before {
            color: #d1d5db;
          }
          /* Special style for the first cell to act as card header */
          .responsive-table td:first-child {
            display: block;
            padding: 0;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 0.75rem;
            padding-bottom: 0.75rem;
          }
          .dark .responsive-table td:first-child {
            border-color: #374151;
          }
          .responsive-table td:first-child::before {
            display: none;
          }
          /* Position action button in top right of card */
          .responsive-table .action-cell {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.25rem;
            border: none;
          }
          .responsive-table .action-cell::before {
            display: none;
          }
        }
      `}</style>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payment Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track payment status, methods, and transaction history
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex w-full sm:w-auto items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${completedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  ${pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ${failedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agency
              </label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Agencies</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.agencyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedAgency("all");
                setStatusFilter("all");
                setMethodFilter("all");
                setDateRange({ from: "", to: "" });
              }}
              className="w-full lg:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Payment Records Table */}
        <div className="bg-white dark:bg-gray-800 md:rounded-lg md:shadow-sm md:overflow-hidden">
          <table className="w-full responsive-table">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Agency & Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 md:divide-y-0">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 md:border-b md:border-gray-200 md:dark:border-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.bookingId}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {record.serviceType} • {record.clientRef}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        TXN: {record.transactionId}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-label="Customer:"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {record.agencyName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {record.customerName}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-label="Amount:"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.currency} {record.amount.toLocaleString()}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-label="Method:"
                  >
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(record.paymentMethod)}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatMethodName(record.paymentMethod)}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-label="Status:"
                  >
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        record.paymentStatus
                      )}`}
                    >
                      {getStatusIcon(record.paymentStatus)}
                      <span className="capitalize">{record.paymentStatus}</span>
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    data-label="Dates:"
                  >
                    <div className="text-sm text-gray-900 dark:text-white">
                      Due: {new Date(record.dueDate).toLocaleDateString()}
                    </div>
                    {record.paymentDate && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Paid: {new Date(record.paymentDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 action-cell">
                    <button
                      onClick={() => handleDownloadVoucher(record)}
                      title="Download Voucher"
                      disabled={
                        pdfLoading && pdfLoadingRecord === record.bookingId
                      }
                      className={`${
                        pdfLoading && pdfLoadingRecord === record.bookingId
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      } transition-colors`}
                    >
                      {pdfLoading && pdfLoadingRecord === record.bookingId ? (
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No payment records found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          )}
        </div>

        {/* PDF Loading Modal */}
        {pdfLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-blue-600 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Generating PDF Receipt
                </h3>
                {pdfLoadingRecord && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Booking ID: {pdfLoadingRecord}
                  </p>
                )}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${pdfProgress}%` }}
                  ></div>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {pdfProgress}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentReport;