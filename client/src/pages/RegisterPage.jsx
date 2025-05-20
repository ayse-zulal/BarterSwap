import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const RegisterPage = () => {
  const [userName, setUserName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [balance, setBalance] = useState("");
  const navigate = useNavigate();
  

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        userName,
        password,
        studentId,
        email,
        balance,
      });

      console.log("Registration successful:", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/"); // girişten sonra yönlendirme yapılabilir

    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ margin: "50px", maxWidth: "400px" }}>
      <h2>Register</h2>

      <input
        type="text"
        name="userName"
        placeholder="UserName"
        value={userName}
        required
        onChange={e => setUserName(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

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

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        required
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="number"
        name="balance"
        placeholder="Initial Balance"
        value={balance}
        required
        onChange={e => setBalance(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        min="0"
        step="0.01"
      />

      <button
        type="submit"
        style={{ width: "100%", padding: "10px", backgroundColor: "lightblue", border: "none" }}
      >
        Register
      </button>
    </form>
  );
};

export default RegisterPage;

