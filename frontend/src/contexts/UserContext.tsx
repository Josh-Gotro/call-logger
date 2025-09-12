import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Local storage key for persisting user session
const USER_STORAGE_KEY = 'callform_user';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  // Save user to local storage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = (name: string, email: string) => {
    setUser({ name, email });
  };

  const logout = () => {
    setUser(null);
    // Clear any auth tokens if using authentication
    localStorage.removeItem('authToken');
  };

  const value: UserContextType = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook for using the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Helper hook to require authentication
export const useRequireAuth = () => {
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated) {
      // TODO: Azure AD Authentication flow
      // In production app, redirect to login page
      // For now, we'll use a simple prompt
      const name = prompt('Please enter your name:');
      const email = prompt('Please enter your email:');

      if (name && email) {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ name, email }));
          window.location.reload(); // Reload to apply user
        } else {
          alert('Please enter a valid email address');
          window.location.reload();
        }
      }
    }
  }, [isAuthenticated]);

  return { user, isAuthenticated };
};