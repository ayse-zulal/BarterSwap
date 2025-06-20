import React, { useEffect, useState } from "react";
import axios from "axios";
import ItemFilters from "../components/ItemFilters.jsx";

const ItemsView = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [bids, setBids] = useState({});
  const [loadingBids, setLoadingBids] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [visibleCountItems, setVisibleCountItems] = useState(20);
  const [visibleCountBids, setVisibleCountBids] = useState(20);


  useEffect(() => {
    loadItems();
  }, [page]);

  const loadItems = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/items`);
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...res.data]);
        setFilteredItems(prev => [...prev, ...res.data]);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const toggleExpand = async (itemId) => {
    if (expandedItemId === itemId) {
      setExpandedItemId(null);
      return;
    }

    setExpandedItemId(itemId);

    if (!bids[itemId]) {
      setLoadingBids(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/bids/item/${itemId}`);
        setBids(prev => ({ ...prev, [itemId]: res.data }));
      } catch (err) {
        console.error("Error loading bids:", err);
      } finally {
        setLoadingBids(false);
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/items/${itemId}`);
      alert("Item deleted successfully.");
      setItems(prev => prev.filter(item => item.itemid !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Could not delete item.");
    }
  };

  const applyItemFilters = async (filters) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`http://localhost:5000/api/items?${query}`);
    setFilteredItems(res.data);
  } catch (err) {
    console.error("Filter error:", err);
  }
};
const visibleItems = filteredItems.length > 0 ? filteredItems : items;


  return (
    <div>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All Items</h2>
      <ItemFilters onApply={applyItemFilters} type={false} />
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "white",
        marginBottom: "24px"
      }}>
        <thead>
          <tr style={{ backgroundColor: "#C3b091", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Image</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Starting Price</th>
            <th style={thStyle}>Current Price</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.slice(0, visibleCountItems).map(item => (
            <>
            <React.Fragment key={item.itemid}>
              <tr>
                <td style={tdStyle}>{item.itemid}</td>
                <td style={tdStyle}>{item.title}</td>
                <td style={tdStyle}>{item.description}</td>
                <td style={tdStyle}><img src={item.image} alt={item.title} style={{ maxWidth: "50px", maxHeight: "50px" }} /></td>
                <td style={tdStyle}>{item.category}</td>
                <td style={tdStyle}>{item.startingprice}</td>
                <td style={tdStyle}>{item.currentprice}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => toggleExpand(item.itemid)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#8fbc8f",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {expandedItemId === item.itemid ? 'Hide Bids' : 'Show Bids'}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.itemid)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dd7171",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      marginLeft: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Delete Item
                  </button>
                </td>
              </tr>

              {expandedItemId === item.itemid && (
                <tr>
                  <td colSpan={8} style={{backgroundColor: "#C3b091", color: "white",textAlign: "left"}}>
                    {bids && bids.length > 0 ? (
                      <ul>
                        {bids.slice(0, visibleCountBids)
                        .sort((a, b) => b.bidamount - a.bidamount).map(bid => (
                          <li key={bid.bidid}>
                            <strong>{bid.bidamount}</strong> by User ID: {bid.userid}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No bids for this item.</p>
                    )}

                    {visibleCountBids < bids.length && (
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
                  </td>
                </tr>
              )}
             
            </React.Fragment>
            

            </>
            
           
          ))}
        </tbody>
      </table>
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
  );
};
const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "left"
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd"
};

export default ItemsView;