import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const { login } = useAuth();

    // --- START: Added for new features ---
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    // --- END: Added for new features ---

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const handleLinkClick = () => setIsMenuOpen(false);

    // --- START: Added Email Validation function ---
    const validateEmail = (email) => {
        const isValid = /\S+@\S+\.\S+/.test(email);
        if (!isValid) {
            setFormErrors(prevErrors => ({ ...prevErrors, email: "Please enter a valid email address." }));
        } else {
            setFormErrors(prevErrors => ({ ...prevErrors, email: "" }));
        }
        return isValid; // Return status for submit handler
    };
    // --- END: Added Email Validation function ---

    const handleChange = (e) => {
        const { id, value } = e.target;
        // Simplified to use id directly, which matches the state keys now
        setFormData(prevData => ({ ...prevData, [id]: value }));

        // --- START: Validate email on change ---
        if (id === 'email') {
            validateEmail(value);
        }
        // --- END: Validate email on change ---
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- START: Final validation before submitting ---
        if (!validateEmail(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }
        // --- END: Final validation before submitting ---

        try {
            const response = await axios.post('http://localhost:5000/api/login', formData);
            
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            login(user);
            alert(response.data.message);

            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            alert('Login failed: ' + (error.response ? error.response.data.message : 'Server error'));
        }
    };

    // --- START: Added password toggle function ---
    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    // --- END: Added password toggle function ---

    return (
        <div className="full_login">
            <header className="header">
                <div className="container">
                    <Link to="/" className="logo">E-Waste<span>Manager</span></Link>
                    <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
                        <Link to="/" onClick={handleLinkClick}>Home</Link>
                        <Link to="/register" onClick={handleLinkClick}>Register</Link>
                    </nav>
                    <button className="mobile-menu-toggle" onClick={toggleMenu}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </header>

            <main className="form-page">
                <div className="form-container">
                    <div className="card">
                        <h2>Login</h2>
                        <form onSubmit={handleSubmit}>
                            {/* --- START: Modified Email Field --- */}
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email" // Changed ID for simpler state handling
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                {formErrors.email && <p style={{ color: 'red' }}>{formErrors.email}</p>}
                            </div>
                            {/* --- END: Modified Email Field --- */}

                            {/* --- START: Modified Password Field --- */}
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label htmlFor="password">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password" // Changed ID for simpler state handling
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span 
                                    onClick={togglePasswordVisibility} 
                                    style={{ 
                                        position: 'absolute', 
                                        right: '15px', 
                                        top: '40px', // Adjust if alignment is off
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                </span>
                            </div>
                            {/* --- END: Modified Password Field --- */}
                            
                            <button type="submit" className="btn">Login</button>
                        </form>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 E-Waste Manager. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Login;