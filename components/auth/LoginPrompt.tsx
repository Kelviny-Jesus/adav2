import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { X } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPrompt({ isOpen, onClose }: LoginPromptProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        className="relative w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-[#1a1c2e] via-[#131525] to-[#0a0a0c] rounded-xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-30 rounded-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0c]/80 rounded-xl"></div>
        
        <div className="bg-[#0d1117]/30 backdrop-blur-md rounded-xl p-8 w-full relative border border-white/5 shadow-2xl">
          <motion.button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="white"/>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 text-center">Message Limit Reached</h2>

          <p className="text-gray-300 mb-6 text-center">
            You've reached the limit of messages for non-registered users.
            Sign in or create an account to continue using Ada without limitations.
          </p>
        
          <div className="flex flex-col space-y-4">
            <motion.button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>

            <motion.button
              onClick={handleRegister}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-lg transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>

            <motion.button
              onClick={onClose}
              className="w-full bg-transparent text-gray-400 hover:text-white py-2 transition-colors"
              whileHover={{ y: -2 }}
            >
              Continue with Limited Access
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
