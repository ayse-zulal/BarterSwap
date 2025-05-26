import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from '../store/AuthStore.ts'; 

const LoginPage = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const fetchUser = useAuthStore(state => state.fetchUser);


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        studentId,
        password
      });

      localStorage.setItem("token", res.data.token);
      fetchUser();
      navigate("/");

    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ margin: "50px", maxWidth: "400px" }}>
      <h2>Login</h2>
      <input
        type="text"
        name="studentId"
        placeholder="Student ID"
        value={studentId}
        required
        onChange={e => setStudentId(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        required
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />
      <button
        type="submit"
        style={{ width: "100%", padding: "10px", backgroundColor: "lightblue", border: "none" }}
      >
        Login
      </button>
    </form>
  );
};

export default LoginPage;

