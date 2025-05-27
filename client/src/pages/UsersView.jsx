import { useEffect, useState } from "react";
import axios from "axios";

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [visibleCountUsers, setVisibleCountUsers] = useState(20);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users").then(res => setUsers(res.data));
  }, [users]);

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user? This cannot be undone.");

    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      alert("Profile deleted successfully.");
    } catch (err) {
      console.error("Failed to delete profile", err);
      alert("An error occurred while deleting your profile.");
    }
  };


  return (
     <div>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All Users</h2>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "white",
        marginBottom: "24px"
      }}>
        <thead>
          <tr style={{ backgroundColor: "#C3b091", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Student Id</th>
            <th style={thStyle}>Balance</th>
            <th style={thStyle}>Login Streak</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.userid}>
              <td style={tdStyle}>{user.userid}</td>
              <td style={tdStyle}>{user.studentname || "-"}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.studentid || "-"}</td>
              <td style={tdStyle}>{user.balance != null ? user.balance : "-"}</td>
              <td style={tdStyle}>{user.loginstreak != null ? user.loginstreak : "-"}</td>
              <td style={tdStyle}>
                <button
                  onClick={() => handleDeleteUser(user.userid)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {visibleCountUsers < users.length && (
                      <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <button
                          onClick={() => setVisibleCountUsers(visibleCountUsers + 20)}
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
export default UsersView;
