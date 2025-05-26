import { useState } from "react";

const ItemFilters = ({ onApply }) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  return (
    <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "row", gap: "0.5rem" }}>
      <input
        type="string"
        placeholder="Item Name"
        style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="date"
        placeholder="Purchase Date"
        style={{padding: "0.5rem", backgroundColor: '#f0efd9', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
        value={date}
        onChange={(e) => setDate(e.target.value)}
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
      
      <button onClick={() => onApply({ minPrice, maxPrice, date, name })} style={{
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
      <button onClick={() => onApply({ minPrice: "", maxPrice:"", date: "", name:"" })} style={{
                      marginTop: '0.5rem',
                      padding: '0.6rem 1.2rem',
                      backgroundColor: 'red',
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

export default ItemFilters;