import { useState, useEffect } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { resetPasswordWithCode, resetPassword } from "../actions/reset-password";

export default function ResetCodeVerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Extract email from URL query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newCode = [...code];
    
    // Handle pasting of full code
    if (value.length > 1 && index === 0) {
      // If pasting a 6-digit code
      if (value.length === 6 && /^\d+$/.test(value)) {
        const digits = value.split("");
        setCode(digits);
        // Focus the last input
        const lastInput = document.getElementById(`code-input-5`);
        if (lastInput) {
          (lastInput as HTMLInputElement).focus();
        }
        return;
      }
    }

    // Handle single digit
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const verificationCode = code.join("");
    
    // Validate code length
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      setIsLoading(false);
      return;
    }

    // Validate password
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Verify the code first
      const verifyResponse = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode
        }),
      });

      const verifyData = await verifyResponse.json() as { status: boolean; msg: string };
      
      // If code verification fails, show error and stop
      if (!verifyResponse.ok || !verifyData.status) {
        setError(verifyData.msg || "Invalid verification code. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Step 2: If code is verified, proceed with password reset
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);
      
      const result = await resetPassword(formData);
      
      if (result.success) {
        setSuccess("Password reset successfully. You will be redirected to login.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(result.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-4xl font-bold text-white">Verify Code</h1>
            <p className="mt-2 text-gray-400">Enter the 6-digit code sent to your email</p>
          </div>

          <div className="bg-[#0d1117]/30 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/5">
            {error && (
              <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
            )}
            {success && (
              <div className="bg-green-500 text-white p-3 rounded-md mb-4">{success}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="email" value={email} />
              
              <div className="space-y-2">
                <label className="text-gray-200 block">
                  Verification Code
                </label>
                <div className="flex justify-between gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-input-${index}`}
                      type="text"
                      maxLength={1}
                      className="w-full aspect-square text-center px-0 py-2 bg-[#0a0a0c]/50 border border-white/10 text-white text-xl font-bold focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-gray-200 block">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full px-4 py-3 bg-[#0a0a0c]/50 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all duration-200"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-gray-200 block">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-3 bg-[#0a0a0c]/50 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all duration-200"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-200 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Didn't receive a code?{" "}
                <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Request again
                </Link>
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
    </div>
  );
}
