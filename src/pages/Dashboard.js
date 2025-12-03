import React, { useState, useEffect } from "react";
import History from "./History";
import Overview from "./Overview";
import AddTransaction from "./AddTransaction";
import WeeklyReport from "./WeeklyReport";
import GenerateQR from "./GenerateQR"; 
import MonthlyBudget from "../components/MonthlyBudget";

import "../styles/Dashboard.css";

import { auth, db } from "../firebase";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);

  // Popup
  const [showBudgetPopup, setShowBudgetPopup] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [popupShownOnce, setPopupShownOnce] = useState(false); // FIX

  // ===========================
  // FETCH TRANSACTIONS
  // ===========================
  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = collection(db, "transactions");
      const snap = await getDocs(ref);

      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.uid === user.uid);

      setTransactions(list);
    };

    fetchTransactions();
  }, []);

  // ===========================
  // CALCULATE REMAINING BUDGET
  // ===========================
  useEffect(() => {
    const calculateRemaining = async () => {
      if (popupShownOnce) return; // show ONCE ONLY

      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return;

      const savedBudget = snap.data().monthlyBudget;
      if (!savedBudget) return;

      // Get month + year
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      // Filter expenses for this month
      const monthlyExpenses = transactions
        .filter((t) => t.type === "expense")
        .filter((t) => {
          let d = t.date;

          // Firestore Timestamp → convert
          if (d && typeof d.toDate === "function") {
            d = d.toDate();
          } else {
            d = new Date(d);
          }

          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, t) => {
          let amt = t.amount;

          if (typeof amt !== "string") amt = String(amt);

          amt = parseFloat(amt.replace(/[^0-9.]/g, "")); // safer clean
          return sum + (isNaN(amt) ? 0 : amt);
        }, 0);

      const remaining = savedBudget - monthlyExpenses;

      setRemainingBudget(remaining);
      setShowBudgetPopup(true);
      setPopupShownOnce(true); // Prevent repeat popup
    };

    if (transactions.length > 0) {
      calculateRemaining();
    }
  }, [transactions, popupShownOnce]);

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Here is your financial summary</p>
      </div>

      {/* TABS */}
      <div className="dashboard-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
          Overview
        </button>
        <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>
          History
        </button>
        <button className={activeTab === "add" ? "active" : ""} onClick={() => setActiveTab("add")}>
          Add Transaction
        </button>
        <button className={activeTab === "weekly" ? "active" : ""} onClick={() => setActiveTab("weekly")}>
          Weekly Report
        </button>
        <button className={activeTab === "qr" ? "active" : ""} onClick={() => setActiveTab("qr")}>
          QR Generator
        </button>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">
        {activeTab === "overview" && <Overview />}
        {activeTab === "history" && <History />}
        {activeTab === "add" && <AddTransaction />}
        {activeTab === "weekly" && <WeeklyReport />}
        {activeTab === "qr" && <GenerateQR />}
      </div>

      {/* MONTHLY BUDGET */}
      {activeTab === "overview" && (
        <MonthlyBudget allTransactions={transactions} />
      )}

      {/* POPUP */}
      {showBudgetPopup && remainingBudget !== null && (
        <div className="budget-popup">
          <div className="popup-content">
            <h4>Budget Reminder</h4>
            <p>Your remaining budget for this month is:</p>
            <h2 className={remainingBudget < 0 ? "text-danger" : "text-success"}>
              ${remainingBudget}
            </h2>

            <button className="btn btn-primary mt-3" onClick={() => setShowBudgetPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
