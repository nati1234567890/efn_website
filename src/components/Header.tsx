import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isTicketsPage = location.pathname === "/tickets";

  return (
    <header className="w-full sticky top-0 z-50 bg-black border-b border-[#f5cc5f]/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 md:py-4">
        {/* Logo Section - Fight Night Editorial Style */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-11 h-11 border border-[#f5cc5f]/30 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black  tracking-tight text-[#f5cc5f] uppercase">
              Fight Night
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isTicketsPage ? "/" : "/tickets")}
            className={`flex items-center gap-2 px-2 md:px-3 py-2.5 text-[11px] md:text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 active:scale-[0.98] ${
              isTicketsPage
                ? "bg-transparent text-[#f5cc5f] border border-[#f5cc5f]/40 hover:border-[#f5cc5f] hover:bg-[#f5cc5f]/5"
                : "bg-[#f5cc5f] text-black hover:bg-[#f5cc5f]/90"
            }`}
          >
            {isTicketsPage ? (
              <>
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back Home</span>
              </>
            ) : (
              <>
                <span>My Tickets</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
