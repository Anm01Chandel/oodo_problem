import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SwapRequests from './pages/SwapRequests';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import SwapManagement from './pages/SwapManagement';

import AdminRoute from './components/routing/AdminRoute';
import PrivateRoute from './components/routing/PrivateRoute';

import { AuthProvider } from './context/AuthContext';
import setAuthToken from './utils/setAuthToken';

import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:id" element={<Profile />} />
            
            {/* Private Routes */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/requests" element={<PrivateRoute><SwapRequests /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/swaps" element={<AdminRoute><SwapManagement /></AdminRoute>} />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;