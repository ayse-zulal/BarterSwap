import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from '../store/AuthStore.ts';
const RegisterPage = () => {
  const [userName, setUserName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fetchUser = useAuthStore(state => state.fetchUser);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(studentId)) {
      return setError("Student ID must be exactly 6 digits.");
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        userName,
        password,
        studentId,
        email,
        balance,
      });

      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <form
        onSubmit={handleRegister}
        style={{
          backgroundColor: "#C3b091",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "white"}}>Please Register</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <input
          type="text"
          placeholder="Student Name"
          value={userName}
          required
          onChange={e => setUserName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Student ID (6 digits)"
          value={studentId}
          required
          onChange={e => setStudentId(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Starting Balance"
          value={balance}
          required
          onChange={e => setBalance(e.target.value)}
          min="0"
          step="0.01"
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#8fbc8f",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: "94%",
  padding: "10px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "5px"
};

const errorStyle = {
    backgroundColor: "#f8d7da",
    color: "#cc0000",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "1rem",
    textAlign: "center",
    fontWeight: "bold"
  }

export default RegisterPage;
