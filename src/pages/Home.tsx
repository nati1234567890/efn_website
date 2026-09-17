import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import PaymentStatusPopup, {
  type PaymentStatus,
} from "../components/PaymentStatusPopup";

type Event = {
  EventId: string;
  EventName: string;
  Description: string;
  NumberOfTicket: number;
  Price: number;
  Status: string;
  EventDate: string;
  Location: string;
};

type FormData = {
  name: string;
  phone: string;
  quantity: string;
};

type FormErrors = {
  name?: string;
  phone?: string;
  quantity?: string;
};

interface StatusResponseData {
  merchantTransactionId: string;
  merchantId: string;
  merchantShortcode: string;
  merchantAccountNumber: string;
  transactionRefId: string;
  currencyCode: string;
  merchantName: string;
  dynamicId: string;
  amount: number;
  paymentReason: string;
  paymentStatus: PaymentStatus;
  expirationDate: Date | string;
  additionalData: any | null;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    quantity: "1",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, any>>({});
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consolidated payment states
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [statusResponseData, setStatusResponseData] =
    useState<StatusResponseData | null>(null);
  const [transactionRefId, setTransactionRefId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using the exact structure from your original code
      const eventData = {
        EventId: "1",
        EventName: "adey expo and festival",
        Description: "CBE adey new year expo",
        NumberOfTicket: 20,
        Price: 200,
        Status: "active",
        EventDate: "2026-08-29",
        Location: "Gurd Shola",
      };

      if (Array.isArray(eventData)) {
        const activeEvent = eventData.find(
          (e: Event) => e.Status.toLowerCase() === "active",
        );

        if (activeEvent) {
          setEvent(activeEvent);
        } else {
          setEvent(null);
          setError("No active events available.");
        }
      } else if (
        eventData &&
        typeof eventData === "object" &&
        eventData.EventId
      ) {
        setEvent(eventData as Event);
      } else {
        setEvent(null);
        setError("No event data received from the server.");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setEvent(null);
      setError("Failed to load event from server. Please try again.");
      toast.error("Failed to load event data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [pollingInterval]);

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return "Full name is required";
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2)
      return "Please enter your full name (first and last name)";
    if (nameParts.length > 3) return "Please enter a valid name (max 3 parts)";
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (!nameRegex.test(name))
      return "Name should only contain letters, spaces, hyphens, or apostrophes";
    if (nameParts.some((part) => part.length < 2))
      return "Each part of the name should be at least 2 characters";
    if (name.length > 50) return "Name is too long (max 50 characters)";
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "Phone number is required";
    const cleanedPhone = phone.replace(/\D/g, "");

    const isValidEthiopianFormat =
      (cleanedPhone.length === 10 && cleanedPhone.startsWith("09")) ||
      (cleanedPhone.length === 12 && cleanedPhone.startsWith("2519")) ||
      (cleanedPhone.length === 13 && cleanedPhone.startsWith("251"));

    if (!isValidEthiopianFormat) {
      return "Please enter a valid Ethiopian phone number (e.g., 0912345678 or 251912345678)";
    }

    return "";
  };

  const validateQuantity = (qty: string): string => {
    const num = parseInt(qty, 10);
    if (!qty || isNaN(num) || num < 1) return "Must buy at least 1 ticket";
    if (event && num > event.NumberOfTicket) {
      return `Only ${event.NumberOfTicket} tickets remaining`;
    }
    return "";
  };

  const validateForm = (): boolean => {
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const qtyError = validateQuantity(formData.quantity);

    const hasErrors = !!(nameError || phoneError || qtyError);

    setErrors({
      name: nameError,
      phone: phoneError,
      quantity: qtyError,
    });

    setTouched({
      name: true,
      phone: true,
      quantity: true,
    });

    return !hasErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTimeout(() => {
      setTouched({ ...touched, [field]: true });
      let error = "";
      switch (field) {
        case "name":
          error = validateName(formData.name);
          break;
        case "phone":
          error = validatePhone(formData.phone);
          break;
        case "quantity":
          error = validateQuantity(formData.quantity);
          break;
      }
      setErrors({ ...errors, [field]: error });
    }, 0);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form before proceeding.");
      return;
    }

    if (!event) {
      toast.error(
        "No active event available. Please wait for event to load or refresh the page.",
      );
      return;
    }

    handleContinueWithPayment();
  };

  // Close popup and clear intervals
  const closePopup = () => {
    setPaymentStatus(null);
    setStatusResponseData(null);
    setTransactionRefId(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Cancel payment
  const cancelPayment = () => {
    closePopup();
  };

  // Start polling for payment status
  const startPollingForStatus = (txnId: string) => {
    let pollCount = 0;
    const maxPolls = 30; // 30 * 3 seconds = 90 seconds maximum

    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    const terminalStatuses = [
      "COMPLETED",
      "REFUNDED",
      "FAILED",
      "CANCELLED",
      "EXPIRED",
    ];

    const interval = setInterval(async () => {
      pollCount++;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/payment/details/by-transaction?merchantTransactionId=${txnId}`,
          { headers: { "Content-Type": "application/json" } },
        );

        const currentStatus = res.data.paymentStatus as PaymentStatus;

        console.log(
          `Polling attempt ${pollCount}/${maxPolls}: Status = ${currentStatus}`,
        );

        // Continuously update the state so the popup can update visually
        setPaymentStatus(currentStatus);
        setStatusResponseData(res.data);

        // Check if the transaction reached a final state
        if (terminalStatuses.includes(currentStatus || "")) {
          clearInterval(interval);
          setPollingInterval(null);

          if (currentStatus === "COMPLETED") {
            console.log("Transaction Details:", res.data);
          }
        } else if (pollCount >= maxPolls) {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentStatus("EXPIRED");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        if (pollCount >= maxPolls) {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentStatus("FAILED");
        }
      }
    }, 3000); // Polls every 3 seconds

    setPollingInterval(interval);
  };

  // Handle payment with USSD by default
  const handleContinueWithPayment = async () => {
    if (!event) {
      toast.error("Event data is missing. Please refresh and try again.");
      return;
    }

    const ticketCount = parseInt(formData.quantity, 10);
    const totalPrice = event.Price * ticketCount;

    try {
      setPaymentStatus("PENDING");

      const paymentrequestData = {
        amount: String(totalPrice),
        initiationMethod: "USSD",
        customerPhone: formData.phone,
      };
      console.log("Payment Request Data:", paymentrequestData);

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/payment/initiate`,
        paymentrequestData,
        { headers: { "Content-Type": "application/json" } },
      );

      const returnedTxnId = res.data.merchantTransactionId;
      console.log("Payment Initiation Response:", res);

      if (!returnedTxnId) {
        setPaymentStatus("FAILED");
        return;
      }

      setTransactionRefId(returnedTxnId);

      // Start polling for status
      startPollingForStatus(returnedTxnId);
    } catch (error) {
      console.error("Payment Error:", error);
      setPaymentStatus("FAILED");
    }
  };

  const renderError = (field: keyof FormErrors) => {
    if (touched[field] && typeof errors[field] === "string") {
      return (
        <p className="text-red-500 text-xs font-bold mt-1.5 pl-1 uppercase tracking-wider">
          {errors[field]}
        </p>
      );
    }
    return null;
  };

  // Dynamic Calculation
  const computedQuantity = parseInt(formData.quantity, 10) || 0;
  const aggregateTotalPrice = event ? event.Price * computedQuantity : 0;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Schedule TBA";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Schedule TBA";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative bg-black text-[#f5cc5f] overflow-x-hidden selection:bg-[#f5cc5f] selection:text-black font-sans">
      <Hero />

      {/* RENDER THE CONSOLIDATED POPUP */}
      <PaymentStatusPopup
        status={paymentStatus}
        transactionRefId={transactionRefId}
        data={statusResponseData}
        onClose={closePopup}
        onCancel={cancelPayment}
      />

      <section className="w-full bg-black pb-24 z-10 px-4 md:px-8 pt-12">
        <form
          onSubmit={handleFormSubmit}
          className="max-w-7xl mx-auto grid gap-10 border-t border-[#f5cc5f]/20 pt-12"
        >
          {/* Event Display Card - Match Card Style */}
          <div className="w-full">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5cc5f]/60 mb-4 flex items-center gap-2">
              s{" "}
              {loading && (
                <span className="text-xs font-normal text-[#f5cc5f]/40 animate-pulse">
                  (Loading...)
                </span>
              )}
              {error && !loading && (
                <span className="text-xs font-normal text-red-500">
                  (Error Loading Event)
                </span>
              )}
            </h4>

            {loading ? (
              <div className="w-full bg-[#0a0a0a] border border-[#f5cc5f]/20 p-6 md:p-8 grid gap-6 md:grid-cols-3 items-start animate-pulse">
                <div className="md:col-span-2 grid gap-3">
                  <div className="h-10 w-64 bg-[#f5cc5f]/10"></div>
                  <div className="h-4 w-full max-w-2xl bg-[#f5cc5f]/10"></div>
                  <div className="h-4 w-3/4 bg-[#f5cc5f]/10"></div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="h-8 w-32 bg-[#f5cc5f]/10"></div>
                    <div className="h-8 w-40 bg-[#f5cc5f]/10"></div>
                    <div className="h-8 w-36 bg-[#f5cc5f]/10"></div>
                  </div>
                </div>
                <div className="flex md:flex-col justify-center items-end gap-3 w-full h-full border-t md:border-t-0 md:border-l border-[#f5cc5f]/20 pt-6 md:pt-0 md:pl-8">
                  <div className="text-left md:text-right">
                    <div className="h-4 w-24 bg-[#f5cc5f]/10 mb-2"></div>
                    <div className="h-10 w-32 bg-[#f5cc5f]/10"></div>
                  </div>
                </div>
              </div>
            ) : event ? (
              <div className="w-full bg-[#0a0a0a] border border-[#f5cc5f]/30 p-6 md:p-8 grid gap-6 md:grid-cols-3 items-start relative overflow-hidden group hover:border-[#f5cc5f]/70 transition-all duration-500">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-20 h-[2px] bg-[#f5cc5f]" />
                <div className="absolute top-0 left-0 w-[2px] h-20 bg-[#f5cc5f]" />
                <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-[#f5cc5f]" />
                <div className="absolute bottom-0 right-0 w-[2px] h-20 bg-[#f5cc5f]" />

                <div className="md:col-span-2 grid gap-3 relative z-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl md:text-3xl font-black text-[#f5cc5f] tracking-tight uppercase">
                      {event.EventName}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 bg-[#f5cc5f] text-black">
                      {event.Status}
                    </span>
                    {event.NumberOfTicket <= 10 && (
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 bg-red-600 text-white animate-pulse">
                        Selling Fast!
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#f5cc5f]/70 leading-relaxed max-w-2xl">
                    {event.Description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] uppercase tracking-wider text-[#f5cc5f]/70">
                    <span className="flex items-center gap-2 border border-[#f5cc5f]/30 px-3 py-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#f5cc5f]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.Location}
                    </span>
                    <span className="flex items-center gap-2 border border-[#f5cc5f]/30 px-3 py-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#f5cc5f]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(event.EventDate)}
                    </span>
                    <span className="flex items-center gap-2 border border-[#f5cc5f]/30 px-3 py-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#f5cc5f]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                      {event.NumberOfTicket} Seats
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col justify-between items-end md:justify-center md:items-end gap-3 w-full h-full border-t md:border-t-0 md:border-l border-[#f5cc5f]/20 pt-6 md:pt-0 md:pl-8 relative z-10">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#f5cc5f]/60 font-bold mb-1">
                      Price / Ticket
                    </p>
                    <p className="text-3xl md:text-4xl font-black text-[#f5cc5f]">
                      {event.Price}
                      <span className="text-sm font-bold text-[#f5cc5f]/60 ml-2">
                        ETB
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#0a0a0a] border border-[#f5cc5f]/20 p-12 text-center">
                <div className="text-5xl mb-4">🥊</div>
                <p className="text-[#f5cc5f] font-bold uppercase tracking-wider">
                  No Event Available
                </p>
                <p className="text-sm text-[#f5cc5f]/50 mt-2">
                  {error || "Please check back later for upcoming events."}
                </p>
                <button
                  onClick={fetchEvent}
                  disabled={loading}
                  className="mt-6 px-8 py-3 bg-[#f5cc5f] text-black font-bold uppercase tracking-wider text-xs hover:bg-[#f5cc5f]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Retry"}
                </button>
              </div>
            )}
          </div>

          {/* Form Section Title */}
          <div className="border-t border-[#f5cc5f]/20 pt-10">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5cc5f]/60 mb-2">
              Your Details
            </p>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-[#f5cc5f]">
              Secure Your Seat.
            </h3>
          </div>

          {/* User Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative md:col-span-1">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur("name")}
                required
                className={`peer w-full bg-[#0a0a0a] border ${
                  touched.name && errors.name
                    ? "border-red-500 focus:border-red-400"
                    : "border-[#f5cc5f]/30 focus:border-[#f5cc5f]"
                } px-4 pt-6 pb-2 focus:outline-none text-[#f5cc5f] placeholder-transparent transition-all duration-200`}
                placeholder="Full Name"
              />
              <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5cc5f]/60 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#f5cc5f] peer-focus:tracking-[0.2em]">
                Full Name *
              </label>
              {renderError("name")}
            </div>

            <div className="relative md:col-span-1">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phone: value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                onBlur={() => handleBlur("phone")}
                required
                className={`peer w-full bg-[#0a0a0a] border ${
                  touched.phone && errors.phone
                    ? "border-red-500 focus:border-red-400"
                    : "border-[#f5cc5f]/30 focus:border-[#f5cc5f]"
                } px-4 pt-6 pb-2 focus:outline-none text-[#f5cc5f] placeholder-transparent transition-all duration-200`}
                placeholder="Phone Number"
              />
              <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5cc5f]/60 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#f5cc5f] peer-focus:tracking-[0.2em]">
                Phone Number *
              </label>
              {renderError("phone")}
            </div>

            <div className="relative md:col-span-1">
              <input
                type="number"
                name="quantity"
                min="1"
                max={event ? event.NumberOfTicket : undefined}
                value={formData.quantity}
                onChange={handleChange}
                onBlur={() => handleBlur("quantity")}
                required
                className={`peer w-full bg-[#0a0a0a] border ${
                  touched.quantity && errors.quantity
                    ? "border-red-500 focus:border-red-400"
                    : "border-[#f5cc5f]/30 focus:border-[#f5cc5f]"
                } px-4 pt-6 pb-2 focus:outline-none text-[#f5cc5f] placeholder-transparent transition-all duration-200`}
                placeholder="Quantity"
              />
              <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5cc5f]/60 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-[#f5cc5f] peer-focus:tracking-[0.2em]">
                Quantity *
              </label>
              {renderError("quantity")}
            </div>
          </div>

          {/* Total Price Panel - Editorial Style */}
          {event && !errors.quantity && (
            <div className="w-full bg-black border border-[#f5cc5f]/30 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f5cc5f]/60 block mb-1">
                  Total Due Amount
                </span>
                <p className="text-4xl md:text-5xl font-black text-[#f5cc5f] leading-none">
                  {aggregateTotalPrice}
                  <span className="text-base font-bold text-[#f5cc5f]/60 ml-2">
                    ETB
                  </span>
                </p>
                {computedQuantity > 0 && (
                  <p className="text-xs font-semibold text-[#f5cc5f]/60 mt-2 uppercase tracking-wider">
                    {computedQuantity} ticket{computedQuantity > 1 ? "s" : ""} ×{" "}
                    {event.Price} ETB
                  </p>
                )}
              </div>
              {event.NumberOfTicket <= 10 && (
                <div className="flex items-center gap-2 border-2 border-[#f5cc5f] px-4 py-2">
                  <span className="text-[#f5cc5f] text-xs font-bold uppercase tracking-wider">
                    ⚡ Only {event.NumberOfTicket} Left
                  </span>
                </div>
              )}
            </div>
          )}

          {loading && !event && (
            <div className="w-full bg-[#0a0a0a] border border-[#f5cc5f]/20 p-6 animate-pulse">
              <div className="h-4 w-32 bg-[#f5cc5f]/10 mb-2"></div>
              <div className="h-10 w-48 bg-[#f5cc5f]/10"></div>
            </div>
          )}

          {/* CTA Button - Bold Editorial Style */}
          <button
            type="submit"
            disabled={!!paymentStatus || loading || !event}
            className={`w-full py-6 bg-[#f5cc5f] text-black font-black uppercase tracking-[0.2em] text-sm md:text-base hover:bg-[#f5cc5f]/90 transition-all duration-300 flex justify-center items-center gap-3 ${
              !!paymentStatus || loading || !event
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {paymentStatus ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Processing Your Booking...
              </>
            ) : loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Loading Event Details...
              </>
            ) : !event ? (
              "No Event Available"
            ) : (
              <>
                <span>🥊 Book Your Seat</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      </section>

      <Footer />

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #0a0a0a inset !important;
          -webkit-text-fill-color: #f5cc5f !important;
          caret-color: #f5cc5f !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input:-moz-autofill {
          background-color: #0a0a0a !important;
          color: #f5cc5f !important;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb {
          background: #f5cc5f;
          border-radius: 0;
        }
        ::-webkit-scrollbar-thumb:hover { background: #d9b34f; }
      `}</style>
    </div>
  );
}
