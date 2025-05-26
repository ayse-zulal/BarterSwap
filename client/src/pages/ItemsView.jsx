import { useEffect, useState } from "react";
import axios from "axios";

const ItemsView = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/items/available").then(res => setItems(res.data));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All Items</h2>
      <ul>
        {items.map(item => (
          <li key={item.itemid}>{item.title} - {item.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default ItemsView;