import { useState, useEffect } from "react";
import { useNavigate, Link } from "@remix-run/react";
import { Eye, EyeSlash, UserPlus } from "@phosphor-icons/react";
import { registerUser } from "../actions/register";
import { useAuth } from "../../hooks/use-auth";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

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
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (passwordError || confirmPasswordError) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const result = await registerUser(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        navigate("/login?registered=true");
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
            <h1 className="text-4xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-gray-400">Register to start using the platform</p>
          </div>

          <div className="bg-[#0d1117]/30 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-white/5">
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
                  className="w-full px-4 py-3 bg-[#0a0a0c]/50 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all duration-200"
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
                  className="w-full px-4 py-3 bg-[#0a0a0c]/50 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all duration-200"
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
                    className="w-full px-4 py-3 bg-[#0a0a0c]/50 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 pr-10 rounded-lg transition-all duration-200"
                    required
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
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
                    className="w-full px-4 py-3 bg-[#0a0a0c]/50 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20 pr-10 rounded-lg transition-all duration-200"
                    required
                    value={confirmPassword}
                    onChange={(e) => validateConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-0 outline-none p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 font-medium"
                disabled={isLoading || !!passwordError || !!confirmPasswordError}
              >
                <UserPlus size={18} />
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
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
