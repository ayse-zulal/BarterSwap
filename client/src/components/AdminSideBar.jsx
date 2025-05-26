const AdminSidebar = ({ setActiveView }) => (
  <div style={{
    width: "220px", background: "#222", color: "white", padding: "24px",
    display: "flex", flexDirection: "column", gap: "16px"
  }}>
    <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Admin Panel</h2>
    <button onClick={() => setActiveView("users")}>All Users</button>
    <button onClick={() => setActiveView("items")}>All Items</button>
    <button onClick={() => setActiveView("bids")}>All Bids</button>
    <button onClick={() => setActiveView("transactions")}>Transactions</button>
    <button onClick={() => setActiveView("reports")}>Generate Reports</button>
  </div>
);
export default AdminSidebar;