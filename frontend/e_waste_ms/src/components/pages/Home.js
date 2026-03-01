import React, { useState, useEffect, useRef } from "react"; // 1. Import useEffect and useRef
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const profileMenuRef = useRef(null); // 2. Create a ref for the profile menu

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/login');
    };
// 3. Add an effect to handle clicks outside the profile dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If the profile menu exists and the click is outside of it, close the dropdown
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        // Add the event listener when the component mounts
        document.addEventListener("mousedown", handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); // Empty dependency array means this effect runs only once
    return (
        <div className="main_div">
            <header className="header">
                <div className="container">
                    <Link to="/" className="logo">E-Waste<span>Manager</span></Link>
                    <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
                        <Link to="/" onClick={handleLinkClick}>Home</Link>
                        <a href="/#services" onClick={handleLinkClick}>Services</a>

                        {/* Conditional Rendering Logic */}

{user ? (
    // Attach the ref to the profile menu's parent div
    <div className="profile-menu" ref={profileMenuRef}>
        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="profile-btn">
            <div className="profile-initial">
                {/* This gets the first letter of the institution's name */}
                {user?.userId?.institutionName?.charAt(0) || 'U'}
            </div>
        </button>
        {isProfileOpen && (
            <div className="profile-dropdown">
                <div className="profile-info">
                    
                    {/* THIS IS THE LINE THAT DISPLAYS THE NAME. */}
                    {/* It looks for the institutionName inside the userId object. */}
                    <h6>{user?.userId?.institutionName}</h6>

                    {/* This correctly shows the login email below the name */}
                    <p>{user?.email}</p>
                </div>

                <Link to="/user-dashboard" onClick={() => setIsProfileOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout}>Logout</button>
            </div>
        )}
    </div>
) : (
    <>
        <Link to="/login" onClick={handleLinkClick}>Login</Link>
        <Link to="/register" onClick={handleLinkClick}>Register</Link>
    </>
)}
                    </nav>

                    <button className="mobile-menu-toggle" onClick={toggleMenu}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </header>

            <main>
                <section className="hero-section">
                    <div className="container text-center">
                        <h1>Responsible E-Waste Recycling</h1>
                        <p>Turn your old electronics into a resource for a greener planet. Schedule a pickup for your e-waste today.</p>
                        <Link
    to={user ? "/user-dashboard" : "/login"}
    className="btn btn-primary"
>
    Schedule a Pickup
</Link>
                    </div>
                </section>

                <section id="services" className="services-section">
                    <div className="container text-center">
                        <h2>Our E-Waste Services</h2>
                        <p className="section-subtitle">We provide comprehensive solutions for safely and responsibly managing electronic waste.</p>
                        <div className="services-grid">
                            <div className="service-card">
                                <i className="fas fa-laptop-house icon"></i>
                                <h3>Residential Pickup</h3>
                                <p>Easy and convenient e-waste collection right from your doorstep.</p>
                            </div>
                            <div className="service-card">
                                <i className="fas fa-building icon"></i>
                                <h3>Corporate Solutions</h3>
                                <p>Customized e-waste management plans for businesses of all sizes.</p>
                            </div>
                            <div className="service-card">
                                <i className="fas fa-database icon"></i>
                                <h3>Data Destruction</h3>
                                <p>Secure and certified data wiping to protect your sensitive information.</p>
                            </div>
                            <div className="service-card">
                                <i className="fas fa-microchip icon"></i>
                                <h3>Component Recovery</h3>
                                <p>Extracting valuable materials from electronics for reuse in new products.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
{/* footer */}
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 E-Waste Manager. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;