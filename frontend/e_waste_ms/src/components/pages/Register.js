import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        category: '',
        institutionName: '',
        institutionEmail: '',
        phoneNumber: '',
        password: '',
        document: null
    });

    // State to hold validation errors
    const [formErrors, setFormErrors] = useState({});
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
    const [isPasswordStrong, setIsPasswordStrong] = useState(true);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const validatePhoneNumber = (number) => {
        const isValid = /^\d{10}$/.test(number);
        setIsPhoneNumberValid(isValid);
        if (!isValid) {
            setFormErrors(prevErrors => ({ ...prevErrors, phoneNumber: "Phone number must be exactly 10 digits." }));
        } else {
            setFormErrors(prevErrors => ({ ...prevErrors, phoneNumber: "" }));
        }
    };

    const validatePassword = (password) => {
        const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        setIsPasswordStrong(isStrong);
        if (!isStrong) {
            setFormErrors(prevErrors => ({ ...prevErrors, password: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character." }));
        } else {
            setFormErrors(prevErrors => ({ ...prevErrors, password: "" }));
        }
    };

    const validateEmail = (email) => {
        const isValid = /\S+@\S+\.\S+/.test(email);
        setIsEmailValid(isValid);
        if (!isValid) {
            setFormErrors(prevErrors => ({ ...prevErrors, institutionEmail: "Please enter a valid email address." }));
        } else {
            setFormErrors(prevErrors => ({ ...prevErrors, institutionEmail: "" }));
        }
    };

    const handleChange = (e) => {
        const { id, value, files } = e.target;

        if (id === 'document') {
            setFormData(prevData => ({
                ...prevData,
                document: files[0]
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [id]: value
            }));

            if (id === 'phoneNumber') {
                validatePhoneNumber(value);
            }

            if (id === 'password') {
                validatePassword(value);
            }
            if (id === 'institutionEmail') {
                validateEmail(value);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation check before submission
        validatePhoneNumber(formData.phoneNumber);
        validatePassword(formData.password);
        validateEmail(formData.institutionEmail);

        if (!isPhoneNumberValid || !isPasswordStrong || !isEmailValid) {
            alert("Please fix the errors before submitting.");
            return;
        }

        const dataToSend = new FormData();
        for (const key in formData) {
            dataToSend.append(key, formData[key]);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/register', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Registration successful:', response.data);
            alert('Registration successful! Please login.');
            navigate('/login');

        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
            alert('Registration failed: ' + (error.response ? error.response.data.message : 'Server error'));
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const handleLinkClick = () => setIsMenuOpen(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
        <div className="full_register">
            <header className="header">
                 <header className="header">
                <div className="container">
                    <Link to="/" className="logo">E-Waste<span>Manager</span></Link>
                    <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
                        <Link to="/" onClick={handleLinkClick}>Home</Link>
                        <Link to="/login" onClick={handleLinkClick}>Login</Link>
                    </nav>
                    <button className="mobile-menu-toggle" onClick={toggleMenu}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </header>
            </header>

            <main className="form-page">
                <div className="form-container">
                    <div className="card">
                        <h2>Create Institution Account</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="category">Registration-Type</label>
                                <select id="category" value={formData.category} onChange={handleChange} required>
                                    <option value="" disabled>Select a category</option>
                                    <option value="school">School</option>
                                    <option value="hospital">Hospital</option>
                                    <option value="railway-station">Railway Station</option>
                                    <option value="office">Office</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="institutionName">Institution Name</label>
                                <input type="text" id="institutionName" placeholder="e.g., Green Valley High" value={formData.institutionName} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="institutionEmail">Institution Email</label>
                                <input type="email" id="institutionEmail" placeholder="contact@institution.com" value={formData.institutionEmail} onChange={handleChange} required />
                                {formErrors.institutionEmail && <p style={{ color: 'red' }}>{formErrors.institutionEmail}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input type="tel" id="phoneNumber" placeholder="e.g., 9876543210" value={formData.phoneNumber} onChange={handleChange} required />
                                {!isPhoneNumberValid && <p style={{ color: 'red' }}>{formErrors.phoneNumber}</p>}
                            </div>

                            {/* --- START: Modified Password Field with EYE ICON --- */}
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label htmlFor="password">Password</label>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="password" 
                                    placeholder="Minimum 8 characters" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <span 
                                    onClick={togglePasswordVisibility} 
                                    style={{ 
                                        position: 'absolute', 
                                        right: '15px', 
                                        top: '40px', // Adjust this value if alignment is off
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                </span>
                                {!isPasswordStrong && <p style={{ color: 'red' }}>{formErrors.password}</p>}
                            </div>
                            {/* --- END: Modified Password Field --- */}

                            <div className="form-group">
                                <label htmlFor="document">Verification Document / Licenses</label>
                                <input type="file" id="document" onChange={handleChange} required />
                            </div>

                            <button type="submit" className="btn btn-primary">Register</button>
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

export default Register;