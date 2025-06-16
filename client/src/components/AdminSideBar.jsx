const navItems = [
  { key: "users", label: "All Users" },
  { key: "items", label: "All Items" },
  { key: "transactions", label: "Transactions" },
  { key: "reports", label: "Generate Reports" },
  { key: "rewards", label: "Create Rewards" },
];

const AdminSidebar = ({ setActiveView, activeView }) => {
  return (
    <div style={{
      width: "240px",
      background: "#C3b091",
      color: "#fff",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      height: "100%",
      boxShadow: "2px 0 8px rgba(0, 0, 0, 0.2)"
    }}>
      <h2 style={{
        fontSize: "22px",
        marginBottom: "24px",
        textAlign: "center",
        fontWeight: "bold",
        color: "#f0f0f0",
        borderBottom: "3px solid rgb(136, 123, 102)",
        paddingBottom: "8px"
      }}>
        Admin Panel
      </h2>
      {navItems.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveView(key)}
          style={{
            background: activeView === key ? "#3a3a55" : "transparent",
            color: "#fff",
            border: "none",
            padding: "12px 16px",
            borderRadius: "8px",
            textAlign: "left",
            cursor: "pointer",
            transition: "background 0.2s",
            fontSize: "16px",
            fontWeight: activeView === key ? "bold" : "normal",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgb(136, 123, 102)"}
          onMouseLeave={e => e.currentTarget.style.background = activeView === key ? "#3a3a55" : "transparent"}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default AdminSidebar;
