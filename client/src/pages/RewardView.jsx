import { useState } from "react";

const AddRewardForm = () => {
  const [form, setForm] = useState({
    rewardtype: "",
    rewardname: "",
    rewardamount: 0,
    conditiontype: "total_spent",
    conditionvalue: 0,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) alert("Reward added: " + data.rewardId);
    else alert("Error: " + data.error);
  };

  return (
    <form onSubmit={handleSubmit} style={{
        maxWidth: "500px",
        margin: "2rem auto",
        padding: "2rem",
        border: "1px solid #e0e0e0",
        borderRadius: "16px",
        backgroundColor: "#fff",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)"
        }}>
        <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1.5rem",
            color: "#333"
        }}>
            Add New Reward
        </h2>

        <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Reward Type</label>
            <input
            name="rewardtype"
            onChange={handleChange}
            placeholder="Type"
            style={inputStyle}
            />
        </div>

        <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Reward Name</label>
            <input
            name="rewardname"
            onChange={handleChange}
            placeholder="Name"
            style={inputStyle}
            />
        </div>

        <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Amount</label>
            <input
            type="integer"
            name="rewardamount"
            onChange={handleChange}
            placeholder="Amount"
            style={inputStyle}
            />
        </div>

        <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Condition Type</label>
            <select
            name="conditiontype"
            onChange={handleChange}
            style={inputStyle}
            >
            <option value="" disabled selected>Select A Condition</option>
            <option value="total_spent">Total Spent</option>
            <option value="total_items_sold">Total Item Sold</option>
            <option value="total_items_listed">Total Items Listed</option>
            <option value="total_items_bought">Total Items Bought</option>
            <option value="total_bids">Total Bids</option>
            <option value="login_streak">Login Streak</option>
            <option value="reputation">Reputation</option>
            </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Condition Value</label>
            <input
            type="integer"
            name="conditionvalue"
            onChange={handleChange}
            placeholder="Condition Value"
            style={inputStyle}
            />
        </div>

        <button
            type="submit"
            style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#8fbc8f",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer"
            }}
        >
           Add Reward
        </button>
        </form>

  );
};
const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "1rem",
  marginTop: "0.25rem"
};

const labelStyle = {
  display: "block",
  fontWeight: "500",
  marginBottom: "0.25rem",
  color: "#555"
};
export default AddRewardForm;
