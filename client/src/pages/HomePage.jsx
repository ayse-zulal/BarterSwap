import useItemStore from "../store/ItemStore.ts";
import React, { useEffect, useState } from "react";

const HomePage = () => {
  const items = useItemStore((state) => state.filteredItems);
  const fetchItems = useItemStore(state => state.fetchItems);
  const filterItems = useItemStore(state => state.filterItems);
    const [visibleCountItems, setVisibleCountItems] = useState(200);

  const [filters, setFilters] = useState({
    searchQuery: "",
    minPrice: "",
    maxPrice: "",
    minBids: "",
    category: "",
    condition: ""
  });

  useEffect(() => {
    filterItems({
      searchQuery: filters.searchQuery,
      minPrice: parseFloat(filters.minPrice) || 0,
      maxPrice: parseFloat(filters.maxPrice) || Infinity,
      minBids: parseInt(filters.minBids) || 0,
      category: filters.category,
      condition: filters.condition
    });
  }, [filters]);
  console.log(items)

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px", color: "#333" }}>
        Currently Auctioning Items
      </h1>

      {/* Filter Section */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", maxWidth: "1000px", width: "100%" }}>
          <input
            type="text"
            placeholder="Search title..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            style={style}
          />
          <input
            type="integer"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            style={style}
          />
          <input
            type="integer"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            style={style}
          />
          <input
            type="integer"
            placeholder="Min Bids"
            value={filters.minBids}
            onChange={(e) => setFilters({ ...filters, minBids: e.target.value })}
            style={style}
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={style}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="books">Books</option>
            <option value="fashion">Clothing</option>
            <option value="home">Home</option>
            <option value="furniture">Furniture</option>
            <option value="beauty">Beauty Products</option>
          </select>
          <select
            value={filters.condition}
            onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
            style={style}
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Used - Like New">Used - Like New</option>
            <option value="Used - Good">Used - Good</option>
            <option value="Used - Acceptable">Used - Acceptable</option>
          </select>
        </div>
      </div>


      {/* Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
        {items.slice(0, visibleCountItems).map((item) => (
          <div key={item.itemid}
            style={{
              backgroundColor: "white", borderRadius: "16px", padding: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)", transition: "box-shadow 0.3s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)"; }}
            onClick={() => window.location.href = `/items/${item.itemid}`}
          >
            <img
              src={item.image || "/placeholder.jpg"}
              alt={item.title}
              style={{
                width: "100%", height: "160px", objectFit: "cover",
                borderRadius: "12px", marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
            />
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#222" }}>{item.title}</h2>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>
              <strong>Category: </strong>{item.category}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#444" }}>
              <span>Starting Price: <strong>{item.startingprice}₺</strong></span>
              <span>Current Price: <strong>{item.currentprice}₺</strong></span>
            </div>
            <div style={{ marginTop: "8px", fontSize: "13px", color: "#666" }}>
              {item.bids?.length || 0} bids
            </div>
          </div>
        ))}

        {visibleCountItems < items.length && (
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
    </div>
  );
};

const style = {
  marginTop: '0.5rem',
  padding: '0.6rem 1.2rem',
  backgroundColor: '#8fbc8f',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};
export default HomePage;
