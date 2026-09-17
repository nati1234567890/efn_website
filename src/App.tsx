import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/notFound";
import Tickets from "./pages/Tickets";
import Layout from "./components/Layout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/not-found" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
