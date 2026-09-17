import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, Calendar, Flame } from "lucide-react";
import Footer from "../components/Footer";

type Ticket = {
  BookingId: string;
  PhoneNumber: string;
  FullName: string;
  Status: string;
  TotalPrice: string;
};

// Mock tickets for UI preview
const MOCK_TICKETS: Ticket[] = [
  {
    BookingId: "mock-ticket-ethiofightnight-001",
    PhoneNumber: "0912345678",
    FullName: "Abebe Kebede",
    Status: "Confirmed",
    TotalPrice: "450",
  },
  {
    BookingId: "mock-ticket-ethiofightnight-002",
    PhoneNumber: "0912345678",
    FullName: "Sara Tesfaye",
    Status: "PaymentPending",
    TotalPrice: "900",
  },
  {
    BookingId: "mock-ticket-ethiofightnight-003",
    PhoneNumber: "0912345678",
    FullName: "Dawit Haile",
    Status: "Cancelled",
    TotalPrice: "450",
  },
];

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [phone] = useState<string | null>("0912345678");
  const [loading] = useState(false);
  const navigate = useNavigate();

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "active":
        return "bg-emerald-500";
      case "pending":
      case "paymentpending":
        return "bg-amber-500";
      case "cancelled":
        return "bg-rose-500";
      default:
        return "bg-amber-400";
    }
  };

  // Helper to format date
  const formatDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return today.toLocaleDateString("en-US", options);
  };

  return (
    <div className="min-h-screen bg-black text-[#f5cc5f] px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 max-w-3xl mx-auto border-b border-[#f5cc5f]/20 pb-6">
        <div>
          <h1 className="text-2xl md:text-xl font-black uppercase tracking-tight text-[#f5cc5f] leading-[0.95]">
            My Tickets.
          </h1>

          {phone && (
            <p className="text-[10px] font-mono text-[#f5cc5f]/40 mt-1">
              {phone}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 border border-[#f5cc5f]/30 px-4 py-3">
          <Ticket className="w-4 h-4 text-[#f5cc5f]" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#f5cc5f] leading-none">
              {tickets?.length || 0}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5cc5f]/60">
              Tickets
            </span>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-6 max-w-3xl mx-auto">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="bg-[#0a0a0a] border border-[#f5cc5f]/20 p-6 md:p-8 grid gap-4 animate-pulse"
            >
              <div className="h-8 w-64 bg-[#f5cc5f]/10" />
              <div className="h-4 w-3/4 bg-[#f5cc5f]/10" />
              <div className="h-4 w-1/2 bg-[#f5cc5f]/10" />
            </div>
          ))
        ) : tickets?.length > 0 ? (
          tickets.map((ticket, index) => (
            <div
              key={`${ticket.BookingId}-${index}`}
              className="bg-[#0a0a0a] border border-[#f5cc5f]/30 p-6 md:p-8 relative overflow-hidden group hover:border-[#f5cc5f]/70 transition-all duration-500"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-16 h-[2px] bg-[#f5cc5f]" />
              <div className="absolute top-0 left-0 w-[2px] h-16 bg-[#f5cc5f]" />
              <div className="absolute bottom-0 right-0 w-16 h-[2px] bg-[#f5cc5f]" />
              <div className="absolute bottom-0 right-0 w-[2px] h-16 bg-[#f5cc5f]" />

              {/* Top row: event + status */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#f5cc5f]/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border border-[#f5cc5f]/40 flex items-center justify-center">
                    <img src="/logo.png" alt="Event" className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f5cc5f]/60">
                      Fight Night 2026
                    </p>
                    <h3 className="text-lg md:text-2xl font-black uppercase tracking-tight text-[#f5cc5f]">
                      {ticket.FullName}
                    </h3>
                  </div>
                </div>

                <div
                  className={`flex items-center px-3 py-1.5 ${getStatusColor(ticket.Status)}`}
                >
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    {ticket.Status || "Active"}
                  </span>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5cc5f]/50 mb-1.5">
                    Ticket ID
                  </p>
                  <p className="font-mono text-xs font-bold text-[#f5cc5f] truncate">
                    #{ticket.BookingId.slice(0, 12)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5cc5f]/50 mb-1.5">
                    Phone
                  </p>
                  <p className="text-xs font-bold text-[#f5cc5f]">
                    {ticket.PhoneNumber}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5cc5f]/50 mb-1.5">
                    Total Price
                  </p>
                  <p className="text-base font-black text-[#f5cc5f]">
                    {ticket.TotalPrice}{" "}
                    <span className="text-[10px] font-bold text-[#f5cc5f]/60">
                      ETB
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5cc5f]/50 mb-1.5">
                    Issued
                  </p>
                  <p className="text-[11px] font-semibold text-[#f5cc5f]/80">
                    {formatDate()}
                  </p>
                </div>
              </div>

              {/* Footer strip */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-dashed border-[#f5cc5f]/20">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5cc5f]/60">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Valid Entry Pass</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5cc5f]">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Fight Night</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className="text-center py-20 bg-[#0a0a0a] border border-[#f5cc5f]/20">
            <div className="text-5xl mb-4">🥊</div>
            <p className="text-[#f5cc5f] font-black uppercase tracking-[0.2em] text-sm mb-2">
              No Tickets Found
            </p>
            <p className="text-xs text-[#f5cc5f]/50 max-w-xs mx-auto">
              It looks like you haven't booked any tickets for Fight Night 2026
              yet.
            </p>
            <button
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                const phoneFromUrl = urlParams.get("phone");
                if (phoneFromUrl) {
                  navigate(`/?phone=${phoneFromUrl}`);
                }
              }}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-[#f5cc5f] text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-[#f5cc5f]/90 transition-all duration-200"
            >
              <Ticket className="w-4 h-4" />
              Book Your Tickets
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
