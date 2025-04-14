import { useState } from "react";
import { Form, useNavigate, Link } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import type { ActionFunction } from "@remix-run/cloudflare";
import VerificationCodePopup from "~/components/auth/VerificationCodePopup";
import PasswordResetPopup from "~/components/auth/PasswordResetPopup";

interface ApiResponse {
  status: boolean;
  msg: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  if (!email) {
    return json({ error: "Email is required" });
  }

  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/send-reset-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json() as ApiResponse;

    if (response.status === 201 && data.status) {
      return json({ success: true, message: data.msg, email });
    } else {
      return json({ error: data.msg });
    }
  } catch (error) {
    console.error("Error sending reset code:", error);
    return json({ error: "Failed to send reset code. Please try again." });
  }
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showPasswordResetPopup, setShowPasswordResetPopup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as ApiResponse;

      if (response.status === 201 && data.status) {
        setSuccess("Reset code sent successfully. Please check your email.");
        // Show verification popup
        setShowVerificationPopup(true);
      } else {
        setError(data.msg);
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
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] bg-gradient-to-br from-[#0a0a0c] via-[#0d1117] to-[#131c2e] relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      <header className="p-4 relative">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="3" fill="white" />
              <circle cx="16" cy="9" r="1.5" fill="white" />
              <circle cx="16" cy="23" r="1.5" fill="white" />
              <circle cx="9" cy="16" r="1.5" fill="white" />
              <circle cx="23" cy="16" r="1.5" fill="white" />
            </svg>
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

          <div className="bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800">
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
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Remember your password?{" "}
                <Link to="/login" className="text-gray-200 hover:text-white">
                  Sign in
                </Link>
              </p>
              <p className="mt-4 text-gray-400">
                Already have a code?{" "}
                <button 
                  onClick={() => setShowVerificationPopup(true)} 
                  className="text-gray-200 hover:text-white bg-transparent border-none p-0 cursor-pointer"
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
