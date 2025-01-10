import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './header.css';

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if the user is authenticated (i.e., if the token exists in localStorage)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Logout function to remove token and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login'); // Redirect to login page after logging out
  };

  return (
    <section className='nav'>
      <div className='logo'>
        <li><Link to="/">Freight Flow</Link></li>
        </div>

      <input id='menu-toggle' type="checkbox" />
      <label className='menu-button-container' htmlFor="menu-toggle">
        <div className='menu-button'></div>
      </label>

      <ul className='menu'>
        {/* Common links that appear for all users */}
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/route-planner">Routing</Link></li>

        {/* Conditionally render based on whether the user is logged in */}
        {isAuthenticated ? (
          <>
            <li><Link to="/user">User</Link></li>
            <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
      </ul>
    </section>
  );
}

export default Header;
