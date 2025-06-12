import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionsView = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [minDate, setMinDate] = useState('');
  const [visibleCountTransactions, setVisibleCountTransactions] = useState(20);
  

  useEffect(() => {
    axios.get("http://localhost:5000/api/transactions")
      .then(res => {
        setTransactions(res.data);
        setFiltered(res.data);
      });
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(tx => {
      const matchSearch = `${tx.itemtitle} ${tx.buyername} ${tx.sellername}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchDate = !minDate || new Date(tx.transactiondate) >= new Date(minDate);

      return matchSearch && matchDate;
    });

    setFiltered(filtered);
  }, [search, minDate, transactions]);

  return (
    <div style={{ padding: "24px" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All Transactions</h2>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by product, buyer, seller..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={minDate}
          onChange={e => setMinDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Desktop Table */}
      <div style={{ overflowX: "auto", display: window.innerWidth >= 768 ? 'block' : 'none' }}>
        <table style={tableStyle}>
          <thead style={{ backgroundColor: "#C3b091", color: "white" }}>
            <tr>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Buyer</th>
              <th style={thStyle}>Seller</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visibleCountTransactions).map(tx => (
              <tr key={tx.transactionid}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={tx.itemimage} alt="item" style={imgStyle} />
                    <div>
                      <strong>{tx.itemtitle}</strong>
                      <p style={{ margin: 0, color: "#777", fontSize: "14px" }}>{tx.itemdescription}</p>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>{tx.buyername}</td>
                <td style={tdStyle}>{tx.sellername}</td>
                <td style={tdStyle}>{tx.price} VC</td>
                <td style={tdStyle}>{new Date(tx.transactiondate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleCountTransactions < filtered.length && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    onClick={() => setVisibleCountTransactions(visibleCountTransactions + 20)}
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

const inputStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  flex: "1",
  color: "white",
  backgroundColor: "#8fbc8f",
  minWidth: "200px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#fff",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
};

const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  fontWeight: "600"
};

const tdStyle = {
  padding: "12px 16px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
  textAlign: "left",
};

const imgStyle = {
  width: "60px",
  height: "60px",
  objectFit: "cover",
  borderRadius: "8px"
};

export default TransactionsView;
