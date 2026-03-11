import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Local storage utilities
const getUsersFromStorage = () => {
  const users = localStorage.getItem('firehub_users');
  return users ? JSON.parse(users) : [];
};

const saveUsersToStorage = (users) => {
  localStorage.setItem('firehub_users', JSON.stringify(users));
};

const generateToken = () => {
  return 'local_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('current_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } catch (error) {
        // Invalid data, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('current_user');
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  }, []);

  const login = async (credentials) => {
      dispatch({ type: 'LOGIN_START' });
      
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const users = getUsersFromStorage();
      const user = users.find(u => u.email === credentials.email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.password !== credentials.password) {
        throw new Error('Invalid password');
      }
      
      const token = generateToken();
      
      // Store session
      localStorage.setItem('token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      
      toast.success('Login successful!');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      
      const message = error.message || 'Login failed. Please try again.';
      toast.error(message);
      
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const users = getUsersFromStorage();
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      // Create new user
      const newUser = {
        id: generateUserId(),
        email: userData.email,
        password: userData.password,
        display_name: userData.display_name,
        user_type: userData.user_type || 'viewer',
        is_creator: userData.user_type === 'creator',
        avatar: null,
        cover_image: null,
        bio: '',
        created_at: new Date().toISOString(),
        subscription_count: 0,
        video_count: 0,
        total_views: 0,
        total_earnings: 0,
        is_verified: false,
        is_active: true,
      };
      
      // Save to storage
      users.push(newUser);
      saveUsersToStorage(users);
      
      const token = generateToken();
      
      // Store session
      localStorage.setItem('token', token);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: newUser, token } });
      
      toast.success('Registration successful! Welcome to Firehub!');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      
      const message = error.message || 'Registration failed. Please try again.';
      toast.error(message);
      
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
    
    dispatch({ type: 'LOGOUT' });
    
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    
    // Update current session
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    
    // Update in users list
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsersToStorage(users);
    }
    
    toast.success('Profile updated successfully');
  };

  const refreshToken = async () => {
    // In local storage mode, just return the existing token
    return state.token;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 