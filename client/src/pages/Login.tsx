import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import Button from "../components/layout/Button";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login(data.email, data.password);
      navigate("/chats");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong. Please try again.";
      toast.error(errorMsg, {
        duration: 3000,
        position: "top-right",
      });
      reset();
      console.error("Login error:", err.response?.data || err.message);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative z-10 flex justify-center mt-24 px-4">
      <motion.div
        className="bg-white/30 border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
          duration: 0.8,
        }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <h1 className="text-3xl font-bold mb-2">Login</h1>
        </motion.div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <motion.input
              type="email"
              placeholder="Email"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 rounded-lg placeholder-gray-500 text-gray-800 focus:outline-none focus:border-black/50 transition-all duration-200"
              variants={inputVariants}
              whileFocus="focus"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
              })}
              autoComplete="off"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
            <motion.input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-400 rounded-lg placeholder-gray-500 text-gray-800 focus:outline-none focus:border-black/50 transition-all duration-200"
              variants={inputVariants}
              whileFocus="focus"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              autoComplete="off"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button type="submit" className="w-full">
              Login
            </Button>
          </motion.div>
        </form>

        {/* Signup Link */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <span className="text-gray-700">Don't have an account? </span>
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors duration-200"
          >
            Signup
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
