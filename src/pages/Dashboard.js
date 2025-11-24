import React, { useState } from "react";
import History from "./History";
import Overview from "./Overview";
import AddTransaction from "./AddTransaction";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="dashboard-container">

      {/* Page Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Here is your financial summary</p>
      </div>

      {/* Summary Cards (from Overview Summary) */}
      {activeTab === "overview" && (
        <div className="dashboard-summary">
          <Overview />
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>

        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Transaction
        </button>
      </div>

      {/* Page Content */}
      <div className="dashboard-content">
        {activeTab === "history" && <History />}
        {activeTab === "add" && <AddTransaction />}
      </div>


    </div>
  );
};

export default Dashboard;
