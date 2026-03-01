// src/App.js - CORRECTED

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/css/style.css'
import { AuthProvider } from './components/context/AuthContext';
import Home from './components/pages/Home';
import Login from './components/pages/Login'
import Register from './components/pages/Register';
import Userdashboard from './components/user/Userdashbord';
import Admindashboard from './components/admin/Admindashbord';

function App() {
  return (
    <AuthProvider> {/* Wrap everything in AuthProvider */}
    <Router>
      <div className="App">
        <Routes>
          {/* Keep these paths lowercase for consistency */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* --- FIX IS HERE: Use lowercase, kebab-case paths --- */}
          <Route path='/user-dashboard' element={<Userdashboard />} />
          <Route path='/admin-dashboard' element={<Admindashboard />} />
        </Routes>
      </div >
    </Router>
     </AuthProvider>
  );
}

export default App;