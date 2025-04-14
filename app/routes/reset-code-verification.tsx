import { useState, useEffect } from "react";
import { Form, useNavigate, Link, useLocation } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import type { ActionFunction } from "@remix-run/cloudflare";
import { resetPasswordWithCode, resetPassword } from "~/actions/reset-password";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const verificationCode = formData.get("code") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !verificationCode || !password || !confirmPassword) {
    return json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return json({ error: "Passwords do not match" });
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
    
    // If code verification fails, return error
    if (!verifyResponse.ok || !verifyData.status) {
      return json({ error: verifyData.msg || "Invalid verification code. Please try again." });
    }
    
    // Step 2: If code is verified, proceed with password reset
    const resetFormData = new FormData();
    resetFormData.append("email", email);
    resetFormData.append("password", password);
    resetFormData.append("confirmPassword", confirmPassword);
    
    const result = await resetPassword(resetFormData);
    
    if (result.success) {
      return json({ success: true, message: "Password reset successfully" });
    } else {
      return json({ error: result.error });
    }
  } catch (error) {
    console.error("Error in reset process:", error);
    return json({ error: "An unexpected error occurred. Please try again." });
  }
};

export default function ResetCodeVerificationPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

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
          navigate("/login");
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
            <h1 className="text-4xl font-bold text-white">Verify Code</h1>
            <p className="mt-2 text-gray-400">Enter the 6-digit code sent to your email</p>
          </div>

          <div className="bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800">
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
                      className="w-full aspect-square text-center px-0 py-2 bg-[#0a0a0c] border border-gray-800 text-white text-xl font-bold focus:border-blue-500 focus:ring-blue-500 rounded-md"
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
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md"
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
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Didn't receive a code?{" "}
                <Link to="/forgot-password" className="text-gray-200 hover:text-white">
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
