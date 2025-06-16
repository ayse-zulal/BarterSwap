import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from '../store/AuthStore.ts';

const LoginPage = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fetchUser = useAuthStore(state => state.fetchUser);
  const tokenExpired = useAuthStore(state => state.tokenExpired);
  const setTokenExpired = useAuthStore(state => state.setTokenExpired);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        studentId,
        password
      });

      localStorage.setItem("token", res.data.token);

      if (tokenExpired) {
        setTokenExpired(false);
        await axios.post(
          "http://localhost:5000/api/auth/increment-streak",
          {},
          { headers: { Authorization: `Bearer ${res.data.token}` } }
        );
      }

      await fetchUser();

      if (studentId === "999999") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      if (message.includes("password")) {
        setError(message);
      } else if (message.includes("No student") || message.includes("no such")) {
        setError(message);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };
  console.log(tokenExpired)

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Please Login</h2>

        {error && <div style={styles.error}>{error}</div>}

        <input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={studentId}
          required
          onChange={e => setStudentId(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    backgroundColor: "#C3b091",
    maxWidth: "400px"
  },
  title: {
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "white"
  },
  input: {
    width: "93%",
    padding: "12px",
    marginBottom: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem"
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#8fbc8f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer"
  },
  error: {
    backgroundColor: "#f8d7da",
    color: "#cc0000",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "1rem",
    textAlign: "center",
    fontWeight: "bold"
  }
};

export default LoginPage;
