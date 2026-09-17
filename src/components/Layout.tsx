import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen bg-linear-to-r from-purple-100 via-indigo-50 to-pink-100">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
