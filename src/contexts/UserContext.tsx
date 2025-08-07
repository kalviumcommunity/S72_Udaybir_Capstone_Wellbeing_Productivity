
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { getAvatarUrl } from '@/utils/avatar';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  gender?: string;
  university?: string;
  major?: string;
  year?: string;
  bio?: string;
}

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  register: (name: string, email: string, password: string, university?: string, major?: string, year?: string, gender?: string, avatar?: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

// API URL - in production, this would be an environment variable
const API_URL = 'http://localhost:8000/api';

// Mock user data for demo when API is not available
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    university: 'Tech University',
    major: 'Computer Science',
    year: '3rd',
    bio: 'CS student passionate about AI and web development.'
  },
  {
    id: '2',
    name: 'Sam Taylor',
    email: 'sam@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    university: 'Tech University',
    major: 'Biology',
    year: '2nd',
    bio: 'Biology student interested in genetics and biodiversity.'
  },
  {
    id: '3',
    name: 'Jamie Smith',
    email: 'jamie@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie',
    university: 'Central College',
    major: 'Psychology',
    year: '4th',
    bio: 'Psychology major researching cognitive development in children.'
  }
];

const UserContext = createContext<UserContextType>({
  currentUser: null,
  isLoading: true,
  setCurrentUser: () => {},
  login: async () => {},
  logout: () => {},
  updateProfile: async () => {},
  register: async () => {},
  refreshSession: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Check if API is available and validate existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check API availability
        const response = await fetch(`${API_URL}/health`);
        setApiAvailable(response.ok);
        
        if (response.ok) {
          // Validate existing token
          const token = localStorage.getItem('authToken');
          if (token) {
            await validateToken(token);
          } else {
            // Auto-login with test user for development
            try {
              await login('test@example.com', 'password123');
            } catch (error) {
              console.log('Auto-login failed, using mock data');
              // Check for saved user data
              const savedUser = localStorage.getItem('currentUser');
              if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
              }
            }
          }
        } else {
          // Fallback to mock data
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.log('API not available, using mock data');
        setApiAvailable(false);
        
        // Load saved user data
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Validate token with backend
  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/users/validate`, {
        method: 'GET',
        headers: {
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    }
  };

  // Refresh session periodically
  useEffect(() => {
    if (currentUser && apiAvailable) {
      const interval = setInterval(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
          validateToken(token);
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [currentUser, apiAvailable]);

  const refreshSession = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await validateToken(token);
    }
  };

  // Update register signature
  const register = async (
    name: string,
    email: string,
    password: string,
    university?: string,
    major?: string,
    year?: string,
    gender?: string,
    avatar?: string
  ) => {
    setIsLoading(true);
    try {
      if (apiAvailable) {
        const response = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            university,
            major,
            year,
            gender,
            avatar
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }
        
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        toast({
          title: "Welcome to Sentience!",
          description: "Account created successfully",
        });
      } else {
        // Mock registration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
        
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          avatar: avatar || getAvatarUrl(gender || 'neutral', 'neutral'),
          university,
          major,
          year,
          gender
        };
        
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        toast({
          title: "Mock Registration",
          description: "Account created with mock data",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (apiAvailable) {
        const response = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }
        
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        toast({
          title: "Welcome back!",
          description: "Logged in successfully",
        });
      } else {
        // Mock login with existing mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user with matching email
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
          throw new Error('User not found');
        }
        
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast({
          title: "Mock Login",
          description: "Logged in with mock data",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;

    try {
      if (apiAvailable) {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Not authorized');
        }
        
        const response = await fetch(`${API_URL}/users/profile`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Profile update failed');
        }
        
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } else {
        // Mock profile update
        const updatedUser = { ...currentUser, ...data };
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        setCurrentUser,
        login,
        logout,
        updateProfile,
        register,
        refreshSession
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
