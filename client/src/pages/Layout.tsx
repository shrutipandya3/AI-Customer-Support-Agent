import { Outlet } from "react-router-dom";
import bgImage from "../assets/bg-light.jpg";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isAuthenticated ? "bg-white" : "bg-cover bg-center"
      }`}
      style={!isAuthenticated ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      <Toaster position="top-right" />

      {/* Navbar at top */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 mt-16">
        <Outlet />
      </main>
    </div>
  );
}
