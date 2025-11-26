import React, { useState } from "react";
import History from "./History";
import Overview from "./Overview";
import AddTransaction from "./AddTransaction";
import WeeklyReport from "./WeeklyReport";
import GenerateQR from "./GenerateQR"; 
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="dashboard-container">

      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Here is your financial summary</p>
      </div>

      <div className="dashboard-tabs">

        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>

        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Transaction
        </button>

        <button
          className={activeTab === "weekly" ? "active" : ""}
          onClick={() => setActiveTab("weekly")}
        >
          Weekly Report
        </button>

        <button
          className={activeTab === "qr" ? "active" : ""}
          onClick={() => setActiveTab("qr")}
        >
          QR Generator
        </button>

      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && <Overview />}
        {activeTab === "history" && <History />}
        {activeTab === "add" && <AddTransaction />}
        {activeTab === "weekly" && <WeeklyReport />}
        {activeTab === "qr" && <GenerateQR />}
      </div>

    </div>
  );
};

export default Dashboard;
