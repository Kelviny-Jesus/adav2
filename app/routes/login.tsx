import { useState, useEffect } from "react";
import { Form, useNavigate, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/cloudflare";
import type { ActionFunction } from "@remix-run/cloudflare";
import { updateProfile } from "~/lib/stores/profile";

interface UserResponse {
  id: number;
  name: string;
  email: string;
  password?: string;
  salt?: string;
  created_at: string;
  session_token: string;
  role?: string;
  plan_status?: string;
  plan?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return json({ error: "Email and password are required" });
  }

  try {
    const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return json({ error: "Invalid credentials" });
    }

    const userData = await response.json() as UserResponse;

    // Verify that we have a session token
    if (!userData.session_token) {
      return json({ error: "Error to proceed to login" });
    }

    // Return the user data (excluding sensitive information)
    return json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        created_at: userData.created_at,
        session_token: userData.session_token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return json({ error: "Error to proceed to login. Please try again." });
  }
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      if (!response.ok) {
        setError("Invalid credentials");
        setIsLoading(false);
        return;
      }

      const userData = await response.json() as UserResponse;

      // Verify that we have a session token
      if (!userData.session_token) {
        setError("Error to proceed to login");
        setIsLoading(false);
        return;
      }

      // Store user data in localStorage
      const userDataForStorage = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        created_at: userData.created_at,
        session_token: userData.session_token,
        role: userData.role || 'user',
        plan_status: userData.plan_status || 'active',
        plan: userData.plan || 'free'
      };

      localStorage.setItem("userData", JSON.stringify(userDataForStorage));
      
      // Update profile store with user data
      updateProfile({
        username: userDataForStorage.name || '',
        bio: userDataForStorage.email || '',
        avatar: ''
      });
      
      navigate("/");
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
            <h1 className="text-4xl font-bold text-white">Login</h1>
            <p className="mt-2 text-gray-400">Sign in to your account to access the platform</p>
          </div>

          <div className="bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800">
            {error && (
              <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
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
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 pr-10 rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-white">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white flex items-center justify-center gap-2 py-2 rounded-md"
                disabled={isLoading}
              >
                <div className="i-ph:sign-in text-lg"></div>
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-gray-200 hover:text-white">
                  Register
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
