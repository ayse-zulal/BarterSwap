import { useEffect, useState } from "react";
import axios from "axios";

const BidsView = () => {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/bids").then(res => setBids(res.data));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All Bids</h2>
      <ul>
        {bids.map(bid => (
          <li key={bid.bidid}>{bid.bidamount}</li>
        ))}
      </ul>
    </div>
  );
};

export default BidsView;