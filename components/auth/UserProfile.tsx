import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { User, SignOut, Gear } from "@phosphor-icons/react";
import { useAuth } from "../../hooks/use-auth";

export function UserProfile() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleSettings = () => {
    // Navigate to settings page (if implemented)
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#1a2b4c] flex items-center justify-center">
          <User size={18} />
        </div>
        <span className="hidden md:block">{user.name}</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0d1117] border border-gray-800 rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-800">
            <p className="text-white font-medium truncate">{user.name}</p>
            <p className="text-gray-400 text-sm truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={handleSettings}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
            >
              <Gear size={16} />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md"
            >
              <SignOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
