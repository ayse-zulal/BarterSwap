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
  const setUser = useAuthStore(state => state.setUser);
  const fetchUser = useAuthStore(state => state.fetchUser);
  const [filteredBids, setFilteredBids] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredPurchasedItems, setFilteredPurchasedItems] = useState(purchasedItems);
  const [visibleCountItems, setVisibleCountItems] = useState(20);
  const [visibleCountPurchase, setVisibleCountPurchase] = useState(20);
  const [visibleCountBids, setVisibleCountBids] = useState(20);
  const [editedName, setEditedName] = useState(user?.student.studentname);
  const [editedEmail, setEditedEmail] = useState(user?.student.email);
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

  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editImage, setEditImage] = useState("");

const handleUpdateItem = (item) => {
  setEditingItem(item);
  setEditTitle(item.title);
  setEditCategory(item.category);
  setEditCondition(item.itemcondition);
  setEditImage(item.image);
};

  useEffect(() => {
    setFilteredBids(bids);
    setFilteredItems(userItems);
    setFilteredPurchasedItems(purchasedItems);
    setEditedName(user?.student.studentname || "");
    setEditedEmail(user?.student.email || "");
  }, [bids, userItems, purchasedItems, user ?? null]);

  const handleDeleteBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to delete this bid?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/bids/${bidId}`);
      setFilteredBids((prev) => prev.filter((bid) => bid.bidid !== bidId));
    } catch (err) {
      console.error("Failed to delete bid", err);
      alert("Failed to delete bid.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/items/${itemId}`);
      await fetchUser(); 
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Could not delete item.");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/students/${user?.student.studentid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentname: editedName,
          email: editedEmail
        })
      });

      if (res.ok) {
        const updated = await res.json();
        alert("Info updated successfully!");

        setUser({
          ...user,
          student: {
            ...user?.student,
            studentname: updated.studentname,
            email: updated.email
          }
        });
      } else {
        alert("Update failed.");
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      alert("An error occurred.");
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your profile? This cannot be undone.");

    if (!confirmed || !user) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${user.user.userid}`);
      alert("Profile deleted successfully.");
      useAuthStore.getState().logout(); 
      window.location.href = "/"; 
    } catch (err) {
      console.error("Failed to delete profile", err);
      alert("An error occurred while deleting your profile.");
    }
  };

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

            <div style={{ marginTop: "1rem" }}>
              <label><strong>Name:</strong></label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                style={{ padding: "0.4rem", width: "100%", marginBottom: "0.5rem", borderRadius: "6px" }}
              />

              <label><strong>Email:</strong></label>
              <input
                type="email"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                style={{ padding: "0.4rem", width: "100%", marginBottom: "0.5rem", borderRadius: "6px" }}
              />

              <button
                onClick={handleUpdate}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#8fbc8f",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Update Info
              </button>
              <button
                onClick={handleDeleteProfile}
                style={{
                  backgroundColor: "#dd7171",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "1rem",
                  marginLeft: "0.5rem"
                }}
              >
                Delete My Profile
              </button>
            </div>

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
          { /* User Bids Section */}
          <h3 style={{ marginBottom: '1rem' }}>Bids</h3>
          <BidFilters onApply={applyBidFilters} />
          {filteredBids?.length > 0 ? (
            <div style={{ marginBottom: '1rem' }}>
              <table style={styles2.table}>
              <thead style={styles2.thead}>
                <tr>
                  <th style={styles2.th}>Item</th>
                  <th style={styles2.th}>Amount</th>
                  <th style={styles2.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids
                  .slice(0, visibleCountBids)
                  .sort((a, b) => b.amount - a.amount)
                  .map((bid, index) => (
                    <tr
                      key={bid.bidid}
                      style={index % 2 === 0 ? styles2.trEven : styles2.trOdd}
                    >
                      <td style={styles2.td}>{bid.itemname}</td>
                      <td style={styles2.td}>{bid.bidamount} coins</td>
                      <td style={styles2.td}>
                        {bid.isactive && (
                          <button
                            onClick={() => handleDeleteBid(bid.bidid)}
                            style={{
                              padding: "0.3rem 0.6rem",
                              backgroundColor: "#dd7171",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {visibleCountBids < filteredBids.length && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    onClick={() => setVisibleCountBids(visibleCountBids + 20)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      backgroundColor: '#8fbc8f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Show More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p style={styles2.noBids}>You haven't placed any bids fitting your filters.</p>
          )}

          { /* User Items and Purchased Items Section */}
          <h3 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Your Items</h3>
          <ItemFilters onApply={applyItemFilters} type={false} />
          {filteredItems?.length > 0 ? (
            <div style={styles.cardGrid}>
              {filteredItems.slice(0, visibleCountItems).map((item) => (
                <div key={item.itemid} style={styles.itemCard}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={styles.itemImage}
                    onClick={() => window.location.href = `/items/${item.itemid}`}
                  />
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemTitle}>{item.title}</h4>
                    <p style={styles.itemDetail}><strong>Category:</strong> {item.category}</p>
                    <p style={styles.itemDetail}><strong>Current Price:</strong> {item.currentprice} coins</p>
                    <p style={styles.itemDetail}><strong>Condition:</strong> {item.itemcondition}</p>
                  </div>
                   {/* update and delete items */}
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                      onClick={() => handleUpdateItem(item)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: '#6495ed',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.itemid)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: '#dd7171',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Delete
                    </button>
                    {editingItem && (
                      <div style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000
                      }}>
                        <div style={{
                          backgroundColor: "white",
                          padding: "2rem",
                          borderRadius: "10px",
                          width: "400px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem"
                        }}>
                          <h3>Update Item</h3>

                          <input
                            type="text"
                            value={editTitle}
                            style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                          />
                          <select
                            value={editCategory}
                            style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
                            onChange={(e) => setEditCategory(e.target.value)}
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
                            value={editCondition}
                            style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
                            onChange={(e) => setEditCondition(e.target.value)}
                            required
                          >
                            <option value="">Select Condition</option>
                            <option value="New">New</option>
                            <option value="Used - Like New">Used - Like New</option>
                            <option value="Used - Good">Used - Good</option>
                            <option value="Used - Acceptable">Used - Acceptable</option>
                          </select>

                          <input
                            type="text"
                            value={editImage}
                            style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
                            onChange={(e) => setEditImage(e.target.value)}
                            placeholder="Image URL"
                          />

                          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                            <button onClick={() => setEditingItem(null)} style={{
                              marginTop: '0.5rem',
                              padding: '0.6rem 1.2rem',
                              backgroundColor: '#dd7171',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}>
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await axios.put(`http://localhost:5000/api/items/${editingItem.itemid}`, {
                                    title: editTitle,
                                    category: editCategory,
                                    itemcondition: editCondition,
                                    image: editImage
                                  });
                                  setEditingItem(null);
                                  fetchUser();
                                } catch (err) {
                                  console.error("Update error:", err);
                                  alert("Update failed");
                                }
                              }}
                              style={{
                                marginTop: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                backgroundColor: '#8fbc8f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {visibleCountItems < filteredItems.length && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    onClick={() => setVisibleCountItems(visibleCountItems + 20)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      backgroundColor: '#8fbc8f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Show More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>You haven't listed any items yet.</p>
          )}

          <h3 style={{ ...styles.sectionTitle, marginTop: '2rem' }}>Purchased Items</h3>
          <ItemFilters onApply={applyItemFilters} type={true} />
          {filteredPurchasedItems.length > 0 ? (
            <div style={styles.cardGrid}>
              {filteredPurchasedItems.slice(0, visibleCountPurchase).map((item) => (
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
              {visibleCountPurchase < filteredPurchasedItems.length && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    onClick={() => setVisibleCountPurchase(visibleCountPurchase + 20)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      backgroundColor: '#8fbc8f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Show More
                  </button>
                </div>
              )}
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

