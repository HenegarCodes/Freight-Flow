import React from 'react';
import './header.css'

function Header() {
  return (
<section className='nav'>
    <div className='logo'>Freight Flow</div>

    <input id='menu-toggle' type="checkbox" />
    <label className='menu-button-container' for="menu-toggle">
        <div className='menu-button'></div>
    </label>
    <ul className='menu'>
        <li>Home</li>
        <li>Search</li>
        <li>Map</li>
        <li>User</li>
    </ul>

</section>
  );
}

export default Header;
