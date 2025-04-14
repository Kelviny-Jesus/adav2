import WithTooltip from '~/components/ui/Tooltip';
import { IconButton } from '~/components/ui/IconButton';
import React, { useState, useEffect } from 'react';
import { useExportLimit } from '../../../../hooks/use-export-limit';
import SubscriptionPlansPopup from '../SubscriptionPlansPopup';
import { toast } from 'react-toastify';

export const ExportChatButton = ({ exportChat }: { exportChat?: () => void }) => {
  // Authentication state
  const [user, setUser] = useState<any>(null);
  const isAuthenticated = !!user;
  
  // Load user data from localStorage on component mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }, []);
  
  // Use the export limit hook
  const {
    exportCount,
    monthlyLimit,
    showSubscriptionPlans,
    incrementExportCount,
    closeSubscriptionPlans,
    canExport
  } = useExportLimit(isAuthenticated, user);
  
  const handleExport = () => {
    // Check if user can export
    if (!canExport) {
      // Show subscription plans popup if export limit is reached
      incrementExportCount();
      return;
    }
    
    // Check if this export would exceed the limit
    const canExportNow = incrementExportCount();
    if (!canExportNow) {
      return;
    }
    
    // Proceed with export
    exportChat?.();
    
    // Show toast with remaining exports
    const remaining = monthlyLimit - exportCount - 1;
    if (remaining > 0) {
      toast.success(`Chat exported! You have ${remaining} exports remaining this month.`);
    } else if (remaining === 0) {
      toast.warning(`Chat exported! This was your last export for this month.`);
    }
  };
  
  return (
    <>
      <WithTooltip tooltip={canExport ? "Export Chat" : "Export limit reached"}>
        <IconButton 
          title="Export Chat" 
          onClick={handleExport}
          disabled={!canExport}
          className={!canExport ? "opacity-50 cursor-not-allowed" : ""}
        >
          <div className="i-ph:download-simple text-xl"></div>
        </IconButton>
      </WithTooltip>
      
      {/* Subscription plans popup */}
      <SubscriptionPlansPopup 
        isOpen={showSubscriptionPlans} 
        onClose={closeSubscriptionPlans} 
      />
    </>
  );
};
