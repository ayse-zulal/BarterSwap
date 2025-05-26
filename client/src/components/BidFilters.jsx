import { useState } from "react";

const BidFilters = ({ onApply }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [wonOnly, setWonOnly] = useState(false);
  const [name, setName] = useState("");

  return (
    <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", flexDirection: "row", gap: "0.5rem" }}>
      <input
        type="string"
        placeholder="Item Name"
        style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="integer"
        placeholder="Min Price"
        style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
      />
      <input
        type="integer"
        placeholder="Max Price"
        style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
      />
      <label style={{
          display: "inline-flex",        
          alignItems: "center",          
          marginRight: "0.5rem",
          padding: "0.5rem",
          backgroundColor: '#f0efd9',
          fontSize: "12px",
          textAlign: "center",
          color: '#767674',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          gap: "0.4rem",                 
        }}>
        <input
          type="checkbox"
          checked={wonOnly}
          onChange={() => setWonOnly(!wonOnly)}
        />
        Won Bids
      </label>
      <button onClick={() => onApply({ minPrice, maxPrice, wonOnly, name })} style={{
                      marginTop: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      backgroundColor: '#8fbc8f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
        Apply Filters
      </button>
      <button onClick={() => {
          setMinPrice("");
          setMaxPrice("");
          setWonOnly(false);
          setName("");
          onApply({ minPrice: "", maxPrice: "", wonOnly:false, name: ""});
        }} style={{
                      marginTop: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      backgroundColor: '#dd7171',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}>
        Reset Filters
      </button>
    </div>
  );
};

export default BidFilters;