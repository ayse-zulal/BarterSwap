import { useEffect, useState } from "react";
import axios from "axios";

const UsersView = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users").then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>All Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.userid}>{user.username} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersView;
