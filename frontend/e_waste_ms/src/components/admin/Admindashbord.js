// File: frontend/src/components/admin/Admindashboard.js (FINAL - with Cancellation Logic)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
// import './AdminDashboard.css'; // Make sure you have created this CSS file

// --- History Modal Component (No changes here) ---
const HistoryModal = ({ history, onClose, isLoading }) => {
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Status Change History</h2>
                <button onClick={onClose} className="modal-close-btn">&times;</button>
                {isLoading ? (
                    <p>Loading history...</p>
                ) : history.length === 0 ? (
                    <p>No status change history found for this request.</p>
                ) : (
                    <ul className="history-list">
                        {history.map(entry => (
                            <li key={entry._id}>
                                <div className="history-timestamp">{new Date(entry.timestamp).toLocaleString()}</div>
                                <div className="history-details">
                                    Status changed from <strong>{entry.previousStatus}</strong> to <strong>{entry.newStatus}</strong> by admin <em>({entry.changedBy?.email || 'N/A'})</em>.
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};


function Admindashboard() {
    // --- State Management, Auth, and Data Fetching (No changes here) ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHistory, setCurrentHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        localStorage.removeItem('token');
        navigate('/login');
    }, [logout, navigate]);
    
    const api = useMemo(() => {
        const token = localStorage.getItem('token');
        return axios.create({
            baseURL: 'http://localhost:5000/api/admin',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }, []);

    const fetchAllRequests = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/requests');
            // We only want to see requests that are not cancelled
            setRequests(response.data.filter(req => req.status !== 'Cancelled'));
        } catch (err) {
            console.error("Failed to fetch requests", err);
            setError('Failed to load requests. You may not have admin privileges.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setTimeout(() => handleLogout(), 2000);
            }
        } finally {
            setIsLoading(false);
        }
    }, [api, handleLogout]);

    useEffect(() => {
        fetchAllRequests();
    }, [fetchAllRequests]);

    // --- EVENT HANDLERS (THIS IS THE MODIFIED FUNCTION) ---
    const handleStatusChange = async (requestId, newStatus) => {
        // --- LOGIC FOR CANCELLING A REQUEST ---
        if (newStatus === 'Cancelled') {
            const isConfirmed = window.confirm(
                'Are you sure you want to cancel this request? It will be removed from the dashboard.'
            );
            // If admin clicks "Cancel" in the popup, stop the function.
            if (!isConfirmed) {
                return;
            }

            const originalRequests = [...requests];
            // Immediately remove the request from the list in the UI for a fast user experience.
            setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));

            try {
                // Send the update to the server.
                await api.put(`/requests/${requestId}/status`, { status: newStatus });
            } catch (error) {
                console.error("Failed to cancel the request", error);
                alert("Failed to cancel the request. The item has been restored.");
                // If the server update fails, put the request back in the list.
                setRequests(originalRequests);
            }
            return; // Exit the function after handling cancellation.
        }

        // --- LOGIC FOR COMPLETING A REQUEST ---
        if (newStatus === 'Completed') {
            const isConfirmed = window.confirm(
                'Are you sure you want to set this request to "Completed"? This will lock the status from further changes.'
            );
            if (!isConfirmed) {
                return;
            }
        }

        // --- Standard logic for all other status changes ---
        const originalRequests = [...requests];
        const updatedRequests = requests.map(req => 
            req._id === requestId ? { ...req, status: newStatus } : req
        );
        setRequests(updatedRequests);

        try {
            await api.put(`/requests/${requestId}/status`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status. Reverting changes.");
            setRequests(originalRequests);
        }
    };

    const handleViewHistory = async (requestId) => {
        setIsModalOpen(true);
        setIsHistoryLoading(true);
        try {
            const response = await api.get(`/requests/${requestId}/history`);
            setCurrentHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
            alert("Could not load history for this request.");
            setIsModalOpen(false);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // --- JSX RENDER (No changes here) ---
    return (
        <div className="full_admindashboard">
            <header className="header">
                <div className="container">
                    <Link to="#" className="logo">E-Waste<span>Manager</span></Link>
                    <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
                        <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
                    </nav>
                    <button className="mobile-menu-toggle" onClick={toggleMenu}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </header>

            <main className="dashboard-page">
                <div className="container">
                    <div className="card">
                        <div className="dashboard-header">
                            <h2>Admin Dashboard</h2>
                            <p>Welcome, {user?.role || 'Admin'}!</p>
                        </div>
                        
                        <div className="admin-requests-container" style={{ marginTop: '2rem' }}>
                            <h3>Manage User E-Waste Requests</h3>
                             
                            {isLoading && <p>Loading requests...</p>}
                            {error && <p className="error-message">{error}</p>}
                            
                            {!isLoading && !error && requests.length === 0 && (
                                <p className="no-items-message">No user requests have been submitted yet.</p>
                            )}

                            {!isLoading && !error && requests.length > 0 && (
                                <div className="admin-request-list">
                                    {requests.map(request => (
                                        <div className="admin-request-card" key={request._id}>
                                            <div className="card-header">
                                                <h4>{request.userId?.institutionName || 'N/A'}</h4>
                                                <span>{new Date(request.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="card-body">
                                                <h5>Items in Request:</h5>
                                                <ul>
                                                    {request.items.map(item => (
                                                        <li key={item._id}>
                                                            <strong>{item.count}x</strong> {item.category} - <em>({item.description})</em>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="card-footer">
                                                <div className="status-display">
                                                    Current Status:
                                                    <span className={`status ${request.status.toLowerCase().replace(/\s/g, '')}`}>{request.status}</span>
                                                </div>
                                                <div className="status-action">
                                                    <label htmlFor={`status-select-${request._id}`}>Change Status:</label>
                                                    <select 
                                                        id={`status-select-${request._id}`}
                                                        value={request.status} 
                                                        onChange={(e) => handleStatusChange(request._id, e.target.value)}
                                                        className="status-select"
                                                        disabled={request.status === 'Completed'}
                                                    >
                                                        <option value="On Progress">On Progress</option>
                                                        <option value="Approved">Approved</option>
                                                        <option value="Collected">Collected</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                                <button 
                                                    onClick={() => handleViewHistory(request._id)} 
                                                    className="btn-view-history"
                                                >
                                                    View History
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <HistoryModal 
                    history={currentHistory} 
                    isLoading={isHistoryLoading} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}

            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 E-Waste Manager. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Admindashboard;