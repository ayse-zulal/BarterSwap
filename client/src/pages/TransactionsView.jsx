import { useEffect, useState } from "react";
import axios from "axios";

const TransactionsView = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/transactions").then(res => setTransactions(res.data));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All Transactions</h2>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.transactionid}>transaction</li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsView;