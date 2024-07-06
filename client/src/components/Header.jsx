import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header() {
  return (
    <section className='nav'>
        <div className='logo'>Freight Flow</div>

        <input id='menu-toggle' type="checkbox" />
        <label className='menu-button-container' htmlFor="menu-toggle">
            <div className='menu-button'></div>
        </label>
        <ul className='menu'>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/map">Map</Link></li>
            <li><Link to="/user">User</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
        </ul>

    </section>
  );
}

export default Header;
