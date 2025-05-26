import axios from "axios";

const ReportsView = () => {
  const downloadReport = async (type) => {
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
  };

  return (
    <div>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Generate Reports</h2>
      <button onClick={() => downloadReport("monthly")}>Monthly Transaction Summary</button><br />
      <button onClick={() => downloadReport("top-users")}>Top Users (Bids/Transactions)</button><br />
      <button onClick={() => downloadReport("category-wise")}>Category-wise Sales</button><br />
      <button onClick={() => downloadReport("competitive-items")}>Most Competitive Items</button>
    </div>
  );
};

export default ReportsView;
