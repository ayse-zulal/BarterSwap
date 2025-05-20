import { useEffect, useState } from "react";
import axios from "axios";

const UserPage = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [bids, setBids] = useState([]);
  const [newItem, setNewItem] = useState({ userId: 0, title: "", description: "", startingPrice: 0, currentPrice: 0, image: "", category: "", itemCondition: "", isActive: false, isRefunded: false });

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

  useEffect(() => {
  if (user) {
    axios.get(`http://localhost:5000/api/items/user/${userId}`)
      .then(res => setUserItems(res.data))
      .catch(err => console.error("Failed to fetch user items", err));
    axios.get(`http://localhost:5000/api/bids/user/${userId}`)
      .then(res => setBids(res.data))
      .catch(err => console.error("Failed to fetch user bids", err));
  }
}, [user]);

  const handleItemCreate = async (e) => {
    e.preventDefault();
    try {
      setNewItem({ ...newItem, userId: user.user.userid })
      console.log(newItem);
      await axios.post("http://localhost:5000/api/items", newItem);
      alert("Item created!");
      setNewItem({ userId: user.user.userid, title: "", description: "", startingPrice: 0, currentPrice: 0, image: "", category: "", itemCondition: "", isActive: false, isRefunded: false });
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
      placeholder="Item Title"
      value={newItem.title}
      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
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
      value={newItem.startingPrice}
      onChange={(e) => setNewItem({ ...newItem, startingPrice: e.target.value, currentPrice: e.target.value })}
      required
    />
    <input
      type="text"
      style={styles.input}
      placeholder="Image URL (jpeg, png, webp, etc.)"
      value={newItem.image}
      onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
      required
    />

    {/* Category (select with enum options) */}
    <select
      style={styles.input}
      value={newItem.category}
      onChange={(e) => setNewItem({ ...newItem, category: e.target.value})}
      required
    >
      <option value="">Select Category</option>
      <option value="electronics">Electronics</option>
      <option value="books">Books</option>
      <option value="clothing">Clothing</option>
      <option value="furniture">Furniture</option>
      <option value="other">Other</option>
    </select>

    {/* Item Condition */}
    <select
      style={styles.input}
      value={newItem.itemCondition}
      onChange={(e) => setNewItem({ ...newItem, itemCondition: e.target.value })}
      required
    >
      <option value="">Select Condition</option>
      <option value="New">New</option>
      <option value="Used - Like New">Used - Like New</option>
      <option value="Used - Good">Used - Good</option>
      <option value="Used - Acceptable">Used - Acceptable</option>
    </select>

    {/* Is Active */}
    <label style={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={newItem.isActive}
        onChange={(e) => setNewItem({ ...newItem, isActive: e.target.checked })}
      />
      Active
    </label>

    {/* Is Refunded */}
    <label style={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={newItem.isRefunded}
        onChange={(e) => setNewItem({ ...newItem, isRefunded: e.target.checked })}
      />
      Refunded
    </label>

    <button style={styles.button}>Create Item</button>
  </form>
</div>


  <div style={styles.card}>
      {/* User'ın Teklifleri */}
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

      <h3 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Your Items</h3>

      {userItems.length > 0 ? (
        <div style={styles.cardGrid}>
          {userItems.map((item) => (
            <div key={item.itemid} style={styles.itemCard}>
              <img src={item.image} alt={item.title} style={styles.itemImage} />
              <div style={styles.itemInfo}>
                <h4 style={styles.itemTitle}>{item.title}</h4>
                <p style={styles.itemDetail}><strong>Category:</strong> {item.category}</p>
                <p style={styles.itemDetail}><strong>Price:</strong> {item.currentprice} coins</p>
                <p style={styles.itemDetail}><strong>Condition:</strong> {item.itemcondition}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't listed any items yet.</p>
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
    fontFamily: "Lexend, sans-serif",
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
    backgroundColor: '#fff',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  input: {
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  textarea: {
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: 'lightblue',
    color: 'white',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
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
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  itemCard: {
    backgroundColor: '#ecd7fa',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  itemCardHover: {
    transform: 'scale(1.02)',
  },
  itemImage: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
  },
  itemInfo: {
    padding: '1rem',
  },
  itemTitle: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
  },
  itemDetail: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '0.3rem',
  },
};

export default UserPage;

