import React, { useState } from "react";
import AdminSidebar from "../components/AdminSideBar.jsx";
import UsersView from "./UsersView";
import ItemsView from "./ItemsView";
import TransactionsView from "./TransactionsView";
import ReportsView from "./ReportsView";
import RewardView from "./RewardView";
import useAuthStore from '../store/AuthStore.ts'; 

const AdminPage = () => {
  const currentUser = useAuthStore(state => state.user);

  const [activeView, setActiveView] = useState("users");

  if (currentUser?.student.studentname !== "ADMIN") {
    return <div style={{ padding: 32 }}>Access Denied. Admins only.</div>;
  }

  const renderView = () => {
    switch (activeView) {
      case "users": return <UsersView />;
      case "items": return <ItemsView />;
      case "transactions": return <TransactionsView />;
      case "reports": return <ReportsView />;
      case "rewards": return <RewardView />;
      default: return <UsersView />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AdminSidebar setActiveView={setActiveView} />
      <div style={{ flex: 1, padding: "24px" }}>{renderView()}</div>
    </div>
  );
};

export default AdminPage;

