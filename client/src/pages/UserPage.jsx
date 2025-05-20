import { useEffect, useState } from "react";
import axios from "axios";

const UserPage = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [student, setStudent] = useState(null);
  const [bids, setBids] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const userData = await axios.get(`http://localhost:5000/api/users/${res.data.userId}`);
        setUserId(res.data.userId);
        setUser(userData.data);
      } catch (err) {
        console.error("User fetch failed:", err);
      }
    };

    fetchUserData();
  }, []);
  console.log(user)

  const handleItemCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/items", newItem, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Item created!");
      setNewItem({ name: "", description: "", price: "" });
    } catch (err) {
      console.error("Item creation failed:", err);
    }
  };

  return (
    <div style={styles.container}>
  <h2 style={styles.title}>👤 User Dashboard</h2>

  {user && (
    <div style={styles.card}>
      <h3 style={styles.sectionTitle}>Your Info</h3>
      <p><strong>Username:</strong> {user.student.studentname}</p>
      <p><strong>Email:</strong> {user.student.email}</p>
      <p><strong>Balance:</strong> {user.balance.balance} coins</p>
    </div>
  )}

  <div style={styles.card}>
    <h3 style={styles.sectionTitle}>Add New Item</h3>
    <form onSubmit={handleItemCreate} style={styles.form}>
      <input
        style={styles.input}
        placeholder="Item Name"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        required
      />
      <textarea
        style={styles.textarea}
        placeholder="Description"
        value={newItem.description}
        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        required
      />
      <input
        type="number"
        style={styles.input}
        placeholder="Price"
        value={newItem.price}
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        required
      />
      <button style={styles.button}>Create Item</button>
    </form>
  </div>

  <div style={styles.card}>
    <h3 style={styles.sectionTitle}>Your Bids</h3>
    {bids.length > 0 ? (
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Item</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => (
            <tr key={bid.bidid}>
              <td style={styles.td}>{bid.itemname}</td>
              <td style={styles.td}>{bid.amount} coins</td>
              <td style={styles.td}>{bid.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>You haven't placed any bids yet.</p>
    )}
  </div>
</div>

  );
};
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1024px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    color: "#333",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  card: {
    backgroundColor: "#ffe4e6",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  textarea: {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "80px",
  },
  button: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0.5rem",
  },
  th: {
    textAlign: "left",
    borderBottom: "2px solid #ddd",
    padding: "0.5rem",
    backgroundColor: "#f5f5f5",
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "0.5rem",
  },
};

export default UserPage;

