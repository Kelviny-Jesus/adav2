import React, { useState } from 'react';

interface PasswordResetPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResetSuccess: () => void;
}

const PasswordResetPopup: React.FC<PasswordResetPopupProps> = ({ 
  isOpen, 
  onClose, 
  email,
  onResetSuccess
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleResetPassword = async () => {
    // Validate passwords
    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Reset the password
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/reset/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password
        }),
      });

      const data = await response.json() as { status: boolean; msg: string };
      
      // If password reset fails, show error
      if (!response.ok || !data.status) {
        setError(data.msg || "Failed to reset password. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // If reset is successful, call the success callback
      onResetSuccess();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117] rounded-lg p-8 w-full max-w-md relative border border-gray-800">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <div className="i-ph:x text-xl"></div>
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-300">
            Create a new password for {email}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
        )}
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-200 block">
              New Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-gray-200 block">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleResetPassword}
            className="w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          
          <div className="text-center mt-4">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPopup;
