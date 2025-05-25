import useItemStore from "../store/ItemStore.ts";
import React, { useEffect } from "react";
const HomePage = () => {
  const items = useItemStore((state) => state.filteredItems);
  const fetchItems = useItemStore(state => state.fetchItems);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <h1 style={{fontSize: "28px", fontWeight: "bold", marginBottom: "24px", color: "#333"}}>
        Currently Auctioning Items
      </h1>

      <div style={{display: "grid",gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",gap: "24px"}}>
        {items.map((item) => (
          <div key={item.itemid} style={{backgroundColor: "white",borderRadius: "16px",padding: "16px",boxShadow: "0 2px 6px rgba(0,0,0,0.1)",transition: "box-shadow 0.3s ease", }}
            onMouseEnter={(e) => {e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";}}
            onMouseLeave={(e) => {e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";}}
            onClick={() => window.location.href = `/items/${item.itemid}`}
          >
            <img
              src={item.image || "/placeholder.jpg"}
              alt={item.title}
              style={{width: "100%",height: "160px",objectFit: "cover",borderRadius: "12px",marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"}}
            />
            <h2 style={{fontSize: "18px",fontWeight: 600,color: "#222"}}>
              {item.title}
            </h2>
            <p style={{fontSize: "14px",color: "#888",marginBottom: "8px"}}>
               <strong>Category: </strong>{item.category}
            </p>
            <div style={{display: "flex",justifyContent: "space-between",fontSize: "14px",color: "#444"}}>
              <span>
                Starting Price: <strong>{item.startingprice}₺</strong>
              </span>
              <span>
                Current Price: <strong>{item.currentprice}₺</strong>
              </span>
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "#666",
              }}
            >
              {item.bids?.length || 0} bids
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
