import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import ItemPage from './pages/ItemPage';
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import useAuthStore from './store/AuthStore.ts';
function App() {

const fetchUser = useAuthStore(state => state.fetchUser);

useEffect(() => {
  fetchUser();
}, []);
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/items/:itemId" element={<ItemPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
