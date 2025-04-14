import { useState, useEffect } from "react";

// Define export limits by plan
const EXPORT_LIMITS: Record<string, number> = {
  free: 0,      // Free users cannot export
  starter: 4,   // Starter users can export up to 4 conversations
  pro: 20,      // Pro users can export up to 20 conversations
  admin: Infinity, // Admin users have unlimited exports
  default: 0    // Default limit for unknown plans
};

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  role?: string;
  plan?: string;
  plan_status?: string;
}

export function useExportLimit(isAuthenticated: boolean, user: User | null) {
  const [exportCount, setExportCount] = useState(0);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(0);

  // Determine export limit based on user plan and role
  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin users have unlimited exports
      if (user.role === 'admin') {
        setMonthlyLimit(Infinity);
        return;
      }

      // Set limit based on plan
      const plan = user.plan?.toLowerCase() || 'free';
      setMonthlyLimit(
        plan in EXPORT_LIMITS ? EXPORT_LIMITS[plan] : EXPORT_LIMITS.default
      );
    } else {
      // Non-authenticated users cannot export
      setMonthlyLimit(0);
    }
  }, [isAuthenticated, user]);

  // Load export count from localStorage on component mount
  useEffect(() => {
    const currentMonth = new Date().getMonth() + '-' + new Date().getFullYear();
    const storedMonthKey = localStorage.getItem("exportCountMonth");
    
    // If it's a new month, reset the counter
    if (storedMonthKey !== currentMonth) {
      localStorage.setItem("exportCountMonth", currentMonth);
      localStorage.setItem("exportCount", "0");
      setExportCount(0);
      return;
    }
    
    const storedCount = localStorage.getItem("exportCount");
    if (storedCount) {
      setExportCount(parseInt(storedCount, 10));
    }
  }, [isAuthenticated]);

  const incrementExportCount = () => {
    // Admin users can always export
    if (isAuthenticated && user?.role === 'admin') {
      return true;
    }
    
    // Free users cannot export
    if (isAuthenticated && user?.plan?.toLowerCase() === 'free') {
      setShowSubscriptionPlans(true);
      return false;
    }
    
    const newCount = exportCount + 1;
    
    // Check if authenticated user has reached their plan limit
    if (isAuthenticated && newCount > monthlyLimit) {
      // Show subscription plans popup for authenticated users who hit their limit
      setShowSubscriptionPlans(true);
      return false;
    }
    
    // Update the export count only if the user can export
    setExportCount(newCount);
    
    // Store the count in localStorage with the current month
    const currentMonth = new Date().getMonth() + '-' + new Date().getFullYear();
    localStorage.setItem("exportCountMonth", currentMonth);
    localStorage.setItem("exportCount", newCount.toString());
    
    return true;
  };

  const resetExportCount = () => {
    setExportCount(0);
    localStorage.setItem("exportCount", "0");
  };
  
  const closeSubscriptionPlans = () => {
    setShowSubscriptionPlans(false);
  };

  return {
    exportCount,
    monthlyLimit,
    showSubscriptionPlans,
    incrementExportCount,
    resetExportCount,
    closeSubscriptionPlans,
    canExport: isAuthenticated ? 
      (user?.role === 'admin' || (user?.plan?.toLowerCase() !== 'free' && exportCount < monthlyLimit)) : 
      false,
  };
}
