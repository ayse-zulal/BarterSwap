import { useEffect, useState } from "react";

const HomePage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffe4e6", 
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "1200px",
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "24px" }}>Available Items</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "24px",
          }}
        >
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.itemid}
                style={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>{item.name}</h3>
                <p style={{ marginBottom: "6px" }}>{item.description}</p>
                <p style={{ marginBottom: "6px" }}><strong>Price:</strong> {item.price} coins</p>
                <p><strong>Owner:</strong> {item.ownerid}</p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center" }}>Loading items...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;