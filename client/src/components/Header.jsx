import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import React, { useState, useEffect } from 'react';
import useItemStore from '../store/ItemStore.ts'; 
import useAuthStore from '../store/AuthStore.ts'; 

const Header = () => {
  const [search, setSearch] = useState("");
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const filterItems = useItemStore(state => state.filterItems);
  const fetchItems = useItemStore(state => state.fetchItems);

useEffect(() => {
  if (search.trim() === "") fetchItems();

  filterItems(search);
}, [search]);


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
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      <nav style={{ display: 'flex', gap: '32px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        {isAuthenticated ? (
        <>
          <span>Welcome, {user?.student.studentname}</span>
          <Link to="/user" style={{ color: 'white', textDecoration: 'none' }}>User Page</Link>
          <button onClick={logout} style={{backgroundColor: '#f0efd9', color: '#C3b091', padding: '10px 20px',border: 'none',borderRadius: '6px',cursor: 'pointer',fontWeight: 'bold',transition: 'background-color 0.3s ease'}}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
          <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
        </>
      )}
      </nav>
    </header>
  );
};

export default Header;
