import axios from "axios";

const ReportsView = () => {
  const downloadReport = async (type) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reports/${type}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Failed to download report.");
    }
  };

  const buttons = [
    { type: "monthly", label: "Monthly Transaction Summary" },
    { type: "top-users", label: "Top Users (Bids/Transactions)" },
    { type: "category-wise", label: "Category-wise Sales" },
    { type: "competitive-items", label: "Most Competitive Items" }
  ];

  return (
    <div style={{
      padding: "24px",
      maxWidth: "600px",
      margin: "auto",
      textAlign: "center",
      background: "#fdf8f3",
      borderRadius: "12px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{
        fontSize: "28px",
        marginBottom: "24px",
        color: "#4b3f2d"
      }}>
        Generate Reports
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {buttons.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => downloadReport(type)}
            style={{
              padding: "12px 20px",
              backgroundColor: "#C3b091",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#a38f7c"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#C3b091"}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportsView;

