import React from 'react';

const DebugUserData: React.FC = () => {
  const showUserData = () => {
    try {
      // Get the current user data from localStorage
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log("User data from localStorage:", parsedUserData);
        alert(JSON.stringify(parsedUserData, null, 2));
      } else {
        console.error("No user data found in localStorage");
        alert("No user data found in localStorage");
      }
    } catch (error) {
      console.error("Error showing user data:", error);
      alert("Error showing user data. See console for details.");
    }
  };
  
  return (
    <button 
      onClick={showUserData}
      className="fixed bottom-16 right-4 bg-gray-600 text-white px-4 py-2 rounded-md z-50"
    >
      Debug User Data
    </button>
  );
};

export default DebugUserData;
