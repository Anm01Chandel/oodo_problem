import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SwapRequests from './pages/SwapRequests'; // Import the new page
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container" style={{padding: '1rem'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login"element={<Login />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<Profile />} /> 
            <Route path="/swaps" element={<SwapRequests />} /> {/* Add the new route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;