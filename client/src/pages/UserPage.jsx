import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from '../store/AuthStore.ts'; 
import Messages from "../components/Messages.jsx";
import BidFilters from "../components/BidFilters.jsx";
import ItemFilters from "../components/ItemFilters.jsx";
const UserPage = () => {
  const user = useAuthStore(state => state.user);
  const purchasedItems = useAuthStore(state => state.purchasedItems);
  const userItems = useAuthStore(state => state.userItems);
  const bids = useAuthStore(state => state.bids);
  const [filteredBids, setFilteredBids] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredPurchasedItems, setFilteredPurchasedItems] = useState(purchasedItems);

  const [newItem, setNewItem] = useState({ userId: 0, title: "", description: "", startingPrice: 0, currentPrice: 0, image: "", category: "", itemCondition: "", isActive: false, isRefunded: false });

  const handleItemCreate = async (e) => {
    e.preventDefault();
    try {
      const itemToPost = {
      ...newItem,
      userId: user.user.userid 
     };
      await axios.post("http://localhost:5000/api/items", itemToPost);
      alert("Item created!");
      setNewItem({ userId: user.user.userid, title: "", description: "", startingPrice: 0, currentPrice: 0, image: "", category: "", itemCondition: "", isActive: false, isRefunded: false });
      window.location.reload();
    } catch (err) {
      console.error("Item creation failed:", err);
    }
  };

  useEffect(() => {
  setFilteredBids(bids);
  setFilteredItems(userItems);
  setFilteredPurchasedItems(purchasedItems);
  }, [bids, userItems, purchasedItems]);

  const applyBidFilters = ({ minPrice, maxPrice, wonOnly, name }) => {
  let filtered = [...bids];

  if (minPrice) filtered = filtered.filter(b => b.bidamount >= parseFloat(minPrice));
  if (maxPrice) filtered = filtered.filter(b => b.bidamount <= parseFloat(maxPrice));
  if (wonOnly) filtered = filtered.filter(b => b.didwin === true);
  if (name) filtered = filtered.filter(b => b.itemname.toLowerCase().includes(name.toLowerCase()));

  setFilteredBids(filtered);
  };

  const applyItemFilters = ({ minPrice, maxPrice, date, name, type }) => {
    let filtered = type ? [...purchasedItems] : [...userItems];
    console.log(date);
    if(type) {
      if (minPrice) filtered = filtered.filter(b => b.price >= parseFloat(minPrice));
      if (maxPrice) filtered = filtered.filter(b => b.price <= parseFloat(maxPrice));
      if (date) filtered = filtered.filter(t => isSameDate(t.transactiondate, date));
      if (name) filtered = filtered.filter(b => b.itemname.toLowerCase().includes(name.toLowerCase()));
      setFilteredPurchasedItems(filtered)
    }
    else {
      if (minPrice) filtered = filtered.filter(b => b.currentPrice >= parseFloat(minPrice));
      if (maxPrice) filtered = filtered.filter(b => b.currentPrice <= parseFloat(maxPrice));
      if (name) filtered = filtered.filter(b => b.title.toLowerCase().includes(name.toLowerCase()));
      setFilteredItems(filtered)
    }
  };

  const isSameDate = (transactionDateStr, filterDateStr) => {
    const transactionDate = new Date(transactionDateStr);
    const [year, month, day] = filterDateStr.split('-').map(Number);

    return (
      transactionDate.getDate() === day &&
      transactionDate.getMonth() + 1 === month && 
      transactionDate.getFullYear() === year
    );
};

  return (
   <div style={layoutStyles.container}>
      <div style={layoutStyles.leftColumn}>
        {user && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Your Info</h3>
            <p><strong>Student Id:</strong> {user.student.studentid}</p>
            <p><strong>Student Name:</strong> {user.student.studentname}</p>
            <p><strong>Email:</strong> {user.student.email}</p>
            <p><strong>Balance:</strong> {user.balance.balance} coins</p>
          </div>
        )}
        <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Messages</h3>
            <Messages
              activeUserId={user?.user.userid}
            />
          </div>
      </div>

      <div style={layoutStyles.rightColumn}>
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

            <select
              style={styles.input}
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="books">Books</option>
              <option value="fashion">Clothing</option>
              <option value="furniture">Furniture</option>
              <option value="home">Home</option>
              <option value="beauty">Beauty Products</option>
              <option value="other">Other</option>
            </select>

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

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newItem.isActive}
                onChange={(e) => setNewItem({ ...newItem, isActive: e.target.checked })}
              />
              Active
            </label>

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
          <h3 style={{ marginBottom: '1rem' }}>Bids</h3>
          <BidFilters onApply={applyBidFilters} />
          {filteredBids?.length > 0 ? (
            <table style={styles2.table}>
              <thead style={styles2.thead}>
                <tr>
                  <th style={styles2.th}>Item</th>
                  <th style={styles2.th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids
                  .sort((a, b) => b.amount - a.amount)
                  .map((bid, index) => (
                    <tr
                      key={bid.bidid}
                      style={index % 2 === 0 ? styles2.trEven : styles2.trOdd}
                    >
                      <td style={styles2.td}>{bid.itemname}</td>
                      <td style={styles2.td}>{bid.bidamount} coins</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p style={styles2.noBids}>You haven't placed any bids fitting your filters.</p>
          )}

          <h3 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Your Items</h3>
          <ItemFilters onApply={applyItemFilters} type={false} />
          {filteredItems?.length > 0 ? (
            <div style={styles.cardGrid}>
              {filteredItems.map((item) => (
                <div key={item.itemid} style={styles.itemCard} onClick={() => window.location.href = `/items/${item.itemid}`}>
                  <img src={item.image} alt={item.title} style={styles.itemImage} />
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemTitle}>{item.title}</h4>
                    <p style={styles.itemDetail}><strong>Category:</strong> {item.category}</p>
                    <p style={styles.itemDetail}><strong>Current Price:</strong> {item.currentprice} coins</p>
                    <p style={styles.itemDetail}><strong>Condition:</strong> {item.itemcondition}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't listed any items yet.</p>
          )}

          <h3 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Purchased Items</h3>
          <ItemFilters onApply={applyItemFilters} type={true} />
          {filteredPurchasedItems.length > 0 ? (
            <div style={styles.cardGrid}>
              {filteredPurchasedItems.map((item) => (
                <div key={item.itemid} style={styles.itemCard} onClick={() => window.location.href = `/items/${item.itemid}`}>
                  <img src={item.image} alt={item.item_title} style={styles.itemImage} />
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemTitle}>{item.item_title}</h4>
                    <p style={styles.itemDetail}><strong>Category:</strong> {item.category}</p>
                    <p style={styles.itemDetail}><strong>Price:</strong> {item.price} coins</p>
                    <p style={styles.itemDetail}><strong>Condition:</strong> {item.itemcondition}</p>
                    <p style={styles.itemDetail}><strong>Purchased On:</strong> {new Date(item.transactiondate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't purchased any items yet.</p>
          )}
        </div>
      </div>
    </div>

  );
};

const layoutStyles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2rem',
    padding: '2rem',
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: '1 1 280px',
    minWidth: '250px',
    textAlign: 'left',
  },
  rightColumn: {
    flex: '2 1 650px',
    minWidth: '250px',
  },
};
const styles2 = {
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  thead: {
    backgroundColor: '#C3b091', // koyu pembe
    color: 'white',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
  },
  tbody: {
    backgroundColor: 'white',
  },
  trOdd: {
    backgroundColor: '#f0efd9', // açık pembe
  },
  trEven: {
    backgroundColor: 'white',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f1f1',
  },
  noBids: {
    color: 'gray',
    fontStyle: 'italic',
  },
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
    backgroundColor: '#8fbc8f',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '1rem',
  },
  itemCard: {
    backgroundColor: '#dcf7d0',
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
    textAlign: 'left',
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

