import React from 'react';

const SetPlanToPro: React.FC = () => {
  const setPlanToPro = () => {
    try {
      // Get the current user data from localStorage
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        
        // Set the plan to "pro"
        parsedUserData.plan = "pro";
        
        // Save the updated user data back to localStorage
        localStorage.setItem("userData", JSON.stringify(parsedUserData));
        
        // Reload the page to see the changes
        window.location.reload();
      } else {
        console.error("No user data found in localStorage");
        alert("No user data found. Please log in first.");
      }
    } catch (error) {
      console.error("Error setting plan to pro:", error);
      alert("Error setting plan to pro. See console for details.");
    }
  };
  
  return (
    <button 
      onClick={setPlanToPro}
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    >
      Set Plan to Pro
    </button>
  );
};

export default SetPlanToPro;
