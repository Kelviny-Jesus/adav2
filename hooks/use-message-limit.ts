import { useState, useEffect } from "react";

// Define message limits by plan
const MESSAGE_LIMITS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: 300,
  default: 10 // Default limit for unknown plans
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

export function useMessageLimit(isAuthenticated: boolean, user: User | null) {
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(0);

  // Determine message limit based on user plan and role
  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin users have unlimited messages
      if (user.role === 'admin') {
        setMonthlyLimit(Infinity);
        return;
      }

      // Set limit based on plan
      const plan = user.plan?.toLowerCase() || 'free';
      setMonthlyLimit(
        plan in MESSAGE_LIMITS ? MESSAGE_LIMITS[plan] : MESSAGE_LIMITS.default
      );
    } else {
      // Non-authenticated users have the default limit
      setMonthlyLimit(1); // Just 1 message for non-authenticated users
    }
  }, [isAuthenticated, user]);

  // Load message count from localStorage on component mount
  useEffect(() => {
    const currentMonth = new Date().getMonth() + '-' + new Date().getFullYear();
    const storedMonthKey = localStorage.getItem("messageCountMonth");
    
    // If it's a new month, reset the counter
    if (storedMonthKey !== currentMonth) {
      localStorage.setItem("messageCountMonth", currentMonth);
      localStorage.setItem("messageCount", "0");
      setMessageCount(0);
      return;
    }
    
    const storedCount = localStorage.getItem("messageCount");
    if (storedCount) {
      setMessageCount(parseInt(storedCount, 10));
    }
  }, [isAuthenticated]);

  // Reset message count when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);

  const incrementMessageCount = () => {
    // Admin users can always send messages
    if (isAuthenticated && user?.role === 'admin') {
      return true;
    }
    
    const newCount = messageCount + 1;
    
    // Show login prompt if message count exceeds limit for non-authenticated users
    if (!isAuthenticated && newCount > 1) {
      setShowLoginPrompt(true);
      return false;
    }
    
    // Check if authenticated user has reached their plan limit
    if (isAuthenticated && newCount > monthlyLimit) {
      // Show subscription plans popup for authenticated users who hit their limit
      setShowSubscriptionPlans(true);
      return false;
    }
    
    // Update the message count only if the user can send the message
    setMessageCount(newCount);
    
    // Store the count in localStorage with the current month
    const currentMonth = new Date().getMonth() + '-' + new Date().getFullYear();
    localStorage.setItem("messageCountMonth", currentMonth);
    localStorage.setItem("messageCount", newCount.toString());
    
    return true;
  };

  const resetMessageCount = () => {
    setMessageCount(0);
    localStorage.setItem("messageCount", "0");
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };
  
  const closeSubscriptionPlans = () => {
    setShowSubscriptionPlans(false);
  };

  return {
    messageCount,
    monthlyLimit,
    showLoginPrompt,
    showSubscriptionPlans,
    incrementMessageCount,
    resetMessageCount,
    closeLoginPrompt,
    closeSubscriptionPlans,
    canSendMessage: isAuthenticated ? 
      (user?.role === 'admin' || messageCount < monthlyLimit) : 
      messageCount < 1,
  };
}
