import { useState } from "react";
import { Link } from "@remix-run/react";
import { sendResetCode } from "../actions/reset-password";
import VerificationCodePopup from "../components/auth/VerificationCodePopup";
import PasswordResetPopup from "../components/auth/PasswordResetPopup";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showPasswordResetPopup, setShowPasswordResetPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const result = await sendResetCode(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess("Reset code sent successfully. Please check your email.");
        // Show verification popup
        setShowVerificationPopup(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    // Close verification popup and open password reset popup
    setShowVerificationPopup(false);
    setShowPasswordResetPopup(true);
  };

  const handleResetSuccess = () => {
    // Close password reset popup and show success message
    setShowPasswordResetPopup(false);
    setSuccess("Password reset successfully. You will be redirected to login.");
    // Redirect to login page after a short delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] bg-gradient-radial from-[#1a1c2e] via-[#131525] to-[#0a0a0c] relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0c]/80"></div>
      <header className="p-4 relative">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-xl font-semibold">Ada</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Reset Password</h1>
            <p className="mt-2 text-gray-400">Enter your email to receive a password reset code</p>
          </div>

          <div className="bg-[#0d1117]/30 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/5">
            {error && (
              <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
            )}
            {success && (
              <div className="bg-green-500 text-white p-3 rounded-md mb-4">{success}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-200 block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-[#0a0a0c]/50 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all duration-200"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-200 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Remember your password?{" "}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Sign in
                </Link>
              </p>
              <p className="mt-4 text-gray-400">
                Already have a code?{" "}
                <button 
                  onClick={() => setShowVerificationPopup(true)} 
                  className="text-purple-400 hover:text-purple-300 transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Enter verification code
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 relative">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Ada. All rights reserved.
        </div>
      </footer>

      {/* Verification Code Popup */}
      <VerificationCodePopup
        isOpen={showVerificationPopup}
        onClose={() => setShowVerificationPopup(false)}
        email={email}
        onVerifySuccess={handleVerificationSuccess}
      />

      {/* Password Reset Popup */}
      <PasswordResetPopup
        isOpen={showPasswordResetPopup}
        onClose={() => setShowPasswordResetPopup(false)}
        email={email}
        onResetSuccess={handleResetSuccess}
      />
    </div>
  );
}
