import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import React, { useState, useEffect } from 'react';
import useItemStore from '../store/ItemStore.ts'; 
import useAuthStore from '../store/AuthStore.ts'; 
import { useNavigate } from 'react-router-dom';
const Header = () => {
  const [search, setSearch] = useState("");
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const filterItems = useItemStore(state => state.filterItems);
  const fetchItems = useItemStore(state => state.fetchItems);
  const navigate = useNavigate();

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

      <nav style={{ display: 'flex', gap: '32px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        {isAuthenticated ? (
        <>
          <span>Welcome, {user?.student.studentname}</span>
          <Link to={user?.student.studentname === "ADMIN" ? "/admin" : "/user"} style={{ color: 'white', textDecoration: 'none' }}>{user?.student.studentname === "ADMIN" ? "Admin Page" : "User Page"}</Link>
          <button onClick={() => { logout(); navigate("/login"); }} style={{backgroundColor: '#f0efd9', color: '#C3b091', padding: '10px 20px',border: 'none',borderRadius: '6px',cursor: 'pointer',fontWeight: 'bold',transition: 'background-color 0.3s ease'}}>Logout</button>
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
