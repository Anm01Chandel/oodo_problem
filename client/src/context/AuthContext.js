import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null,
};

const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      // 1. Set token in localStorage
      localStorage.setItem('token', action.payload.token);
      // 2. CRITICAL FIX: Immediately apply the token to axios headers for future requests
      setAuthToken(action.payload.token);
      // 3. Update the state
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        error: null, // Clear previous errors
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
    case 'REGISTER_FAIL':
      localStorage.removeItem('token');
      setAuthToken(null); // Remove the header
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // This function now primarily handles loading the user on initial page load/refresh
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/user`);
      dispatch({ type: 'USER_LOADED', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };
  
  // Load user once on app start
  useEffect(() => {
    loadUser();
  }, []);

  // Register User
  const register = async (formData) => {
     const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/users`, formData, config);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'REGISTER_FAIL', payload: err.response.data.msg });
    }
  };
  
  // Login User
  const login = async (formData) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth`, formData, config);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'LOGIN_FAIL', payload: err.response.data.msg });
    }
  };

  // Logout
  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;