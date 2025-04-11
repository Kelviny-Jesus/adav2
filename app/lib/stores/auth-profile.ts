import { updateProfile } from './profile';

// Initialize profile from authentication data
export function initializeProfileFromAuth() {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Update the profile store with user data
        updateProfile({
          username: user.name || '',
          bio: user.email || '',
          avatar: '' // No avatar in our auth system yet
        });
      }
    } catch (error) {
      console.error('Error initializing profile from auth:', error);
    }
  }
}

// Call this function when the app starts
if (typeof window !== 'undefined') {
  // Run on next tick to ensure DOM is loaded
  setTimeout(() => {
    initializeProfileFromAuth();
  }, 0);
}
