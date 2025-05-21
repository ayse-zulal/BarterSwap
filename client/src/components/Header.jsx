import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import React, { useState } from 'react';
const Header = () => {
  const [search, setSearch] = useState("");
  return (
    <header
      style={{
        backgroundColor: '#C3b091',
        color: 'white',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >

      <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={logo} alt="Logo" style={{ width: '40px', height: 'auto', paddingRight: '12px' }} />
      <span style={{ fontSize: '24px', fontWeight: 'bold', paddingRight: '12px' }}>SwapSwap</span>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: 'none',
            width: '60%',
            maxWidth: '400px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',}}
        />
      </div>

      <nav style={{ display: 'flex', gap: '32px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link to="/user" style={{ color: 'white', textDecoration: 'none' }}>User Page</Link>
        <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin Page</Link>
        <Link to="/item" style={{ color: 'white', textDecoration: 'none' }}>Item Page</Link>
      </nav>
    </header>
  );
};

export default Header;

