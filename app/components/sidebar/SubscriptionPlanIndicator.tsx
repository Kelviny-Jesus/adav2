import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import SubscriptionPlansPopup from '~/components/chat/SubscriptionPlansPopup';

interface SubscriptionPlanIndicatorProps {
  className?: string;
  onPopupOpen?: () => void;
  onPopupClose?: () => void;
}

const SubscriptionPlanIndicator: React.FC<SubscriptionPlanIndicatorProps> = ({ 
  className = '',
  onPopupOpen,
  onPopupClose
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showPlansPopup, setShowPlansPopup] = useState(false);
  
  // Get the user's plan from the user object
  const userPlan = user?.plan?.toLowerCase() || 'free';
  
  // Determine if the user can upgrade (only non-pro users can upgrade)
  const canUpgrade = userPlan !== 'pro' && userPlan !== 'admin';
  
  // Get display name for the plan
  const getPlanDisplayName = (plan: string): string => {
    switch (plan) {
      case 'pro':
        return 'Pro';
      case 'starter':
        return 'Starter';
      case 'admin':
        return 'Admin';
      case 'free':
      default:
        return 'Free';
    }
  };
  
  // Get color class for the plan
  const getPlanColorClass = (plan: string): string => {
    switch (plan) {
      case 'pro':
        return 'text-blue-500';
      case 'starter':
        return 'text-green-500';
      case 'admin':
        return 'text-purple-500';
      case 'free':
      default:
        return 'text-gray-400';
    }
  };
  
  const planDisplayName = getPlanDisplayName(userPlan);
  const planColorClass = getPlanColorClass(userPlan);
  
  const handleOpenPlansPopup = () => {
    setShowPlansPopup(true);
    if (onPopupOpen) onPopupOpen();
  };
  
  const handleClosePlansPopup = () => {
    setShowPlansPopup(false);
    if (onPopupClose) onPopupClose();
  };
  
  // Notify parent component when popup state changes
  useEffect(() => {
    if (showPlansPopup) {
      if (onPopupOpen) onPopupOpen();
    } else {
      if (onPopupClose) onPopupClose();
    }
  }, [showPlansPopup, onPopupOpen, onPopupClose]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center gap-1">
        <div className="i-ph:crown-simple-fill h-4 w-4 text-yellow-500" />
        <div className="flex flex-col">
          <span className={`text-sm font-medium leading-tight ${planColorClass}`}>
            {planDisplayName}
          </span>
          
          {canUpgrade && (
            <button
              onClick={handleOpenPlansPopup}
              className="text-xs text-gray-400 hover:text-gray-300 text-left leading-tight border-none bg-transparent p-0"
              aria-label="Upgrade plan"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
      
      <SubscriptionPlansPopup 
        isOpen={showPlansPopup} 
        onClose={handleClosePlansPopup} 
      />
    </div>
  );
};

export default SubscriptionPlanIndicator;
