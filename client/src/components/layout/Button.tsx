import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "py-3 rounded-lg font-semibold shadow-lg transition-all duration-200";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white",
    secondary:
      "bg-gradient-to-r from-[#c8e6f0] via-[#b5dce9] to-[#a0cfe0] hover:from-[#b5dce9] hover:via-[#a0cfe0] hover:to-[#8fc2d8] text-gray-800 border border-[#a0cfe0]",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${
        disabled ? disabledStyles : ""
      } ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
}
