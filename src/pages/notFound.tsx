import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState<string | null>(null);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const phoneFromUrl = urlParams.get("phone");

    if (!phoneFromUrl) {
      navigate("/not-found");
    } else {
      setPhone(phoneFromUrl);
    }
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-indigo-200 px-6 text-center">
      <h1 className="text-9xl font-extrabold text-indigo-700 mb-6">404</h1>
      <p className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
        Oops! Page Not Found
      </p>
      <p className="text-gray-600 mb-8">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      <button
        onClick={() => navigate("/?phone=" + (phone || ""))}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all transform hover:scale-105"
      >
        Go Back Home
      </button>
    </div>
  );
}
