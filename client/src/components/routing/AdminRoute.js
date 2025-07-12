import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/auth', {
                    headers: { 'x-auth-token': token }
                });
                if (res.data && res.data.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Auth check failed', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, [token]);

    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    // If loading is finished, check if user is an admin.
    // If they are, render the child route (Outlet).
    // Otherwise, redirect them to the home page.
    return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;