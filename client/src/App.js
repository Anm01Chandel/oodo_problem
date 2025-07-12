import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SwapRequests from './pages/SwapRequests';
import AdminRoute from './components/routing/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import SwapManagement from './pages/SwapManagement';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container" style={{padding: '1rem'}}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Private User Routes */}
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<Profile />} /> 
            <Route path="/swaps" element={<SwapRequests />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="swaps" element={<SwapManagement />} />
            </Route>

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;