import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.nav
      className={`w-full fixed top-0 left-0 shadow-md px-6 py-4 flex justify-between items-center z-50 backdrop-blur-md ${
        isAuthenticated ? "bg-[#c8e6f0]" : "bg-white/40"
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 20, duration: 1 }}
    >
      <h1 className="text-lg md:text-xl font-bold">
        AI Customer Support Agent
      </h1>

      {isAuthenticated && (
        <motion.div
          className="space-x-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          <Link
            to="#"
            onClick={handleLogout}
            className="font-semibold text-black hover:underline"
          >
            {/* Show text on medium+ screens */}
            <span className="hidden sm:inline">Logout</span>
            {/* Show icon on small screens */}
            <LogOut className="inline sm:hidden w-5 h-5" />
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
