import { useState } from "react";
import { Form, useNavigate, Link } from "@remix-run/react";
import { json } from "@remix-run/cloudflare";
import type { ActionFunction } from "@remix-run/cloudflare";
import { updateProfile } from "~/lib/stores/profile";

interface ApiResponse {
  status: boolean;
  msg: string;
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return json({ error: "All fields are required" });
  }

  if (!passwordRegex.test(password)) {
    return json({ error: "Password does not meet complexity requirements" });
  }

  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/create/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json() as ApiResponse;

    if (data.status) {
      return json({ success: true, message: "Account created successfully. Please log in." });
    } else {
      return json({ error: data.msg });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return json({ error: "Failed to register user. Please try again." });
  }
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (value: string) => {
    if (!passwordRegex.test(value)) {
      setPasswordError(
        "Password must contain at least 8 characters including uppercase, lowercase, number, and special character."
      );
    } else {
      setPasswordError("");
    }
    setPassword(value);
    
    // Also validate confirm password if it's already been entered
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword, value);
    }
  };

  const validateConfirmPassword = (value: string, pass = password) => {
    if (value !== pass) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
    setConfirmPassword(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate form before submission
    if (passwordError || confirmPasswordError) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/create/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json() as ApiResponse;

      if (data.status) {
        navigate("/login?registered=true");
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
            <h1 className="text-4xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-gray-400">Register to start using the platform</p>
          </div>

          <div className="bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800">
            {error && (
              <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-gray-200 block">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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

              <div className="space-y-2">
                <label htmlFor="password" className="text-gray-200 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 pr-10 rounded-md"
                    required
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <div className={showPassword ? "i-ph:eye-slash text-lg" : "i-ph:eye text-lg"}></div>
                  </button>
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-gray-200 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 pr-10 rounded-md"
                    required
                    value={confirmPassword}
                    onChange={(e) => validateConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <div className={showConfirmPassword ? "i-ph:eye-slash text-lg" : "i-ph:eye text-lg"}></div>
                  </button>
                </div>
                {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white flex items-center justify-center gap-2 py-2 rounded-md"
                disabled={isLoading || !!passwordError || !!confirmPasswordError}
              >
                <div className="i-ph:user-plus text-lg"></div>
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-gray-200 hover:text-white">
                  Sign in
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
