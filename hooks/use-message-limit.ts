import { useState, useEffect } from "react";

export function useMessageLimit(isAuthenticated: boolean) {
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Load message count from localStorage on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      const storedCount = localStorage.getItem("messageCount");
      if (storedCount) {
        setMessageCount(parseInt(storedCount, 10));
      }
    }
  }, [isAuthenticated]);

  // Reset message count when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      setMessageCount(0);
      localStorage.removeItem("messageCount");
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);

  const incrementMessageCount = () => {
    if (!isAuthenticated) {
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      localStorage.setItem("messageCount", newCount.toString());

      // Show login prompt if message count exceeds limit
      if (newCount > 1) {
        setShowLoginPrompt(true);
      }
    }
    return true; // Always return true for authenticated users
  };

  const resetMessageCount = () => {
    setMessageCount(0);
    localStorage.removeItem("messageCount");
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  return {
    messageCount,
    showLoginPrompt,
    incrementMessageCount,
    resetMessageCount,
    closeLoginPrompt,
    canSendMessage: isAuthenticated || messageCount < 1,
  };
}
