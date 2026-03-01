// File: frontend/src/components/user/Userdashboard.js (FINAL CORRECTED VERSION - MIN & MAX WORD COUNT)

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../context/AuthContext';

// --- MODIFICATION: Define both MIN and MAX word limits as constants ---
const DESCRIPTION_MIN_WORDS = 3;
const DESCRIPTION_MAX_WORDS = 50;

function Userdashboard() {
    // --- STATE MANAGEMENT ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [ewasteCategory, setEwasteCategory] = useState("");
    const [ewasteDescription, setEwasteDescription] = useState("");
    const [ewasteCount, setEwasteCount] = useState("");
    const [savedRequests, setSavedRequests] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [requestHistory, setRequestHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // --- AUTH & API SETUP ---
    const handleLogout = useCallback(() => {
        logout();
        localStorage.removeItem('token');
        navigate('/login');
    }, [logout, navigate]);

    const api = useMemo(() => {
        const token = localStorage.getItem('token');
        return axios.create({
            baseURL: 'http://localhost:5000/api',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }, []);

    // --- DATA FETCHING ---
    const fetchSavedItems = useCallback(async () => {
        try {
            const response = await api.get('/ewaste/saved');
            setSavedRequests(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) handleLogout();
        }
    }, [api, handleLogout]);

    const fetchRequestHistory = useCallback(async () => {
        try {
            const response = await api.get('/ewaste/history');
            setRequestHistory(response.data);
        } catch (error) {
            console.error("Error fetching request history:", error);
        }
    }, [api]);

    // --- EFFECTS ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleLogout();
            return;
        }
        Promise.all([fetchSavedItems(), fetchRequestHistory()]);
    }, [fetchSavedItems, fetchRequestHistory, handleLogout]);

    useEffect(() => {
        const newTotalCount = savedRequests.reduce((sum, request) => sum + parseInt(request.count || 0), 0);
        setTotalCount(newTotalCount);
    }, [savedRequests]);

    const descriptionWordCount = useMemo(() => {
        if (!ewasteDescription.trim()) return 0;
        const words = ewasteDescription.trim().split(/\s+/).filter(Boolean);
        return words.length;
    }, [ewasteDescription]);
    
    // --- EVENT HANDLERS ---
    const handleSaveRequest = async (e) => {
        e.preventDefault();
        const countToAdd = parseInt(ewasteCount);

        if (!ewasteCategory || !ewasteDescription.trim() || !countToAdd || countToAdd <= 0) {
            return alert("Please fill in all fields correctly.");
        }
        
        if (countToAdd > 15) {
            return alert("You can only add a maximum of 15 items for a single entry.");
        }

        // --- MODIFICATION START: Add validation for MINIMUM and MAXIMUM word count ---
        if (descriptionWordCount < DESCRIPTION_MIN_WORDS) {
            return alert(`The description must be at least ${DESCRIPTION_MIN_WORDS} words.`);
        }

        if (descriptionWordCount > DESCRIPTION_MAX_WORDS) {
            return alert(`The description cannot exceed ${DESCRIPTION_MAX_WORDS} words.`);
        }
        // --- MODIFICATION END ---

        setIsLoading(true);
        try {
            await api.post('/ewaste/save', { category: ewasteCategory, description: ewasteDescription, count: countToAdd });
            setEwasteCategory("");
            setEwasteDescription("");
            setEwasteCount("");
            await fetchSavedItems();
            alert("Item saved successfully!");
        } catch (error) {
            alert("Failed to save item.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveRequest = async (itemId) => {
        setIsLoading(true);
        try {
            await api.delete(`/ewaste/remove/${itemId}`);
            await fetchSavedItems();
        } catch (error) {
            alert("Failed to remove item.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAllRequests = async () => {
        if (savedRequests.length === 0) {
            return alert("No items to submit.");
        }
        setIsLoading(true);
        try {
            await api.post('/ewaste/submit');
            await Promise.all([fetchSavedItems(), fetchRequestHistory()]);
            alert("All requests submitted successfully!");
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Failed to submit requests.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- HELPER FUNCTIONS ---
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const handleLinkClick = () => setIsMenuOpen(false);
    
    const isStepActive = (currentStatus, step) => {
        const statuses = ['On Progress', 'Approved', 'Collected', 'Completed'];
        return statuses.indexOf(currentStatus) >= statuses.indexOf(step);
    };

    return (
        <div className="full_userdashboard">
            <header className="header">
                  <div className="container">
                <Link to="/" className="logo">E-Waste<span>Manager</span></Link>
                <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={handleLinkClick}>Home</Link>
                    <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
                </nav>
                <button className="mobile-menu-toggle" id="mobile-menu-toggle" onClick={toggleMenu}>
                    <i className="fas fa-bars"></i>
                </button>
            </div>
            </header>

            <main className="dashboard-page">
                <div className="container">
                    <div className="card">
                        <div className="dashboard-header">
                            <h2>User Dashboard</h2>
                            <p>Welcome back, {user?.userId?.institutionName || 'User'}!</p>
                        </div>
                        <div className="total-ewaste-count">
                            <h3>Total Items for Collection: <span>{totalCount}</span></h3>
                        </div>

                        <h3>Add New E-Waste Item</h3>
                        <form onSubmit={handleSaveRequest}>
                            <div className="form-group">
                            <label htmlFor="category">E-Waste Category</label>
                            <select
                                id="category"
                                value={ewasteCategory}
                                onChange={(e) => setEwasteCategory(e.target.value)}
                                required
                            >
                                <option value="">-- Select a Category --</option>
                                <option>Smartphones</option>
                                <option>Laptops</option>
                                <option>Televisions</option>
                                <option>Refrigerators</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            {/* --- MODIFICATION: Updated placeholder to include min word requirement --- */}
                            <textarea
                                id="description"
                                placeholder={`e.g., 2 old smartphones (min ${DESCRIPTION_MIN_WORDS} words)`}
                                rows="3"
                                value={ewasteDescription}
                                onChange={(e) => setEwasteDescription(e.target.value)}
                                required
                            ></textarea>
                            <div 
                                className="word-counter"
                                style={{ 
                                    textAlign: 'right', 
                                    fontSize: '0.85rem', 
                                    color: descriptionWordCount > DESCRIPTION_MAX_WORDS ? 'red' : '#666' 
                                }}
                            >
                                {descriptionWordCount}/{DESCRIPTION_MAX_WORDS} words
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="count">Count</label>
                            <input
                                type="number"
                                id="count"
                                min="1"
                                max="15" 
                                placeholder="Number of items (Max 15 per entry)"
                                value={ewasteCount}
                                onChange={(e) => setEwasteCount(e.target.value)}
                                required
                            />
                        </div>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Item'}
                            </button>
                        </form>

                         <h3>Your Saved Items</h3>
                        {savedRequests.length > 0 ? (
                            <div className="ewaste-table-container">
                                <table className="admin-table">
                                     <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Description</th>
                                            <th>Count</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {savedRequests.map((item) => (
                                            <tr key={item._id}>
                                                <td>{item.category}</td>
                                                <td>{item.description}</td>
                                                <td>{item.count}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-remove" 
                                                        onClick={() => handleRemoveRequest(item._id)}
                                                        disabled={isLoading} 
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button 
                                    className="btn btn-submit-all" 
                                    onClick={handleSubmitAllRequests}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Submitting...' : `Submit All Requests (${savedRequests.length} items)`}
                                </button>
                            </div>
                        ) : (
                             <p className="no-items-message">No items added yet. Use the form above to add your e-waste.</p>
                        )}
                        
                        <hr className="divider" />

                        <h3>Your Request History</h3>
                        {requestHistory.length > 0 ? (
                            <div className="request-history">
                                {requestHistory.map((request) => (
                                    <div className="request-card" key={request._id}>
                                        <p><strong>Status:</strong> <span className={`status ${request.status.toLowerCase().replace(/\s/g, '')}`}>{request.status}</span></p>
                                        <p><strong>Date Submitted:</strong> {new Date(request.date).toISOString().slice(0, 10)}</p>
                                        
                                        <div className="request-items-list">
                                            <strong>Items in this request:</strong>
                                            <ul>
                                                {request.items.map(item => (
                                                    <li key={item._id}>
                                                        {item.count}x {item.category} - <em>({item.description})</em>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        {request.status !== 'Cancelled' ? (
                                            <div className="progress-bar">
                                                <div className={`progress-step ${isStepActive(request.status, 'On Progress') ? 'active' : ''}`}>On Progress</div>
                                                <div className={`progress-step ${isStepActive(request.status, 'Approved') ? 'active' : ''}`}>Approved</div>
                                                <div className={`progress-step ${isStepActive(request.status, 'Collected') ? 'active' : ''}`}>Collected</div>
                                                <div className={`progress-step ${isStepActive(request.status, 'Completed') ? 'active' : ''}`}>Completed</div>
                                            </div>
                                        ) : (
                                            <p className="cancelled-message">This request has been cancelled by the admin.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-items-message">No past requests found.</p>
                        )}
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

export default Userdashboard;