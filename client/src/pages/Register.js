import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Form.css';

const Register = () => {
    const authContext = useContext(AuthContext);
    const { register, error, isAuthenticated } = authContext;
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        password2: ''
    });

    const { name, email, password, password2 } = user;

    const onChange = e => setUser({ ...user, [e.target.name]: e.target.value });

    const onSubmit = e => {
        e.preventDefault();
        if (password !== password2) {
            alert('Passwords do not match'); // Replace with better alert system
        } else {
            register({ name, email, password });
        }
    };

    return (
        <div className="form-container">
            <h1>Account <span className="text-primary">Register</span></h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" name="name" value={name} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" name="email" value={email} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" value={password} onChange={onChange} required minLength="6" />
                </div>
                <div className="form-group">
                    <label htmlFor="password2">Confirm Password</label>
                    <input type="password" name="password2" value={password2} onChange={onChange} required minLength="6" />
                </div>
                <input type="submit" value="Register" className="btn btn-primary btn-block" />
            </form>
            {error && <p className="error-msg">{error}</p>}
        </div>
    );
};

export default Register;