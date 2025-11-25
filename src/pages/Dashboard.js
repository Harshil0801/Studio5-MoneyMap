import React, { useState, useEffect } from "react";
import History from "./History";
import Overview from "./Overview";
import AddTransaction from "./AddTransaction";
import "../styles/Dashboard.css";
import MonthlyBudget from "../components/MonthlyBudget";
import { auth, db } from "../firebase";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);

  // 🔥 Popup states
  const [showBudgetPopup, setShowBudgetPopup] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState(null);

  // Fetch all transactions from TOP-LEVEL collection
  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = collection(db, "transactions");
      const snap = await getDocs(ref);

      const list = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((t) => t.uid === user.uid);

      console.log("Fetched transactions:", list);
      setTransactions(list);
    };

    fetchTransactions();
  }, []);

  // 🔥 Calculate remaining budget for popup
  useEffect(() => {
    const calculateRemaining = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Fetch saved budget
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return;

      const savedBudget = snap.data().monthlyBudget;
      if (!savedBudget) return;

      // Calculate expenses for current month
      const now = new Date();
      const monthlyExpenses = transactions
        .filter((t) => t.type === "expense")
        .filter((t) => {
          const date = new Date(t.date);
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, t) => {
          let amt = t.amount;

          if (typeof amt === "number") amt = amt.toString();

          amt = amt
            .replace("$", "")
            .replace("-", "")
            .replace("+", "");

          return sum + Number(amt);
        }, 0);

      const remaining = savedBudget - monthlyExpenses;

      setRemainingBudget(remaining);
      setShowBudgetPopup(true); // Show popup 🌟
    };

    if (transactions.length > 0) {
      calculateRemaining();
    }
  }, [transactions]);

  return (
    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Here is your financial summary</p>
      </div>

      {/* Summary for Overview */}
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

      {/* Monthly Budget */}
      {activeTab === "overview" && (
        <MonthlyBudget allTransactions={transactions} />
      )}

      {/* 🔥 POPUP UI */}
      {showBudgetPopup && remainingBudget !== null && (
        <div className="budget-popup">
          <div className="popup-content">
            <h4>Budget Reminder</h4>
            <p>Your remaining budget for this month is:</p>
            <h2 className={remainingBudget < 0 ? "text-danger" : "text-success"}>
              ${remainingBudget}
            </h2>

            <button
              className="btn btn-primary mt-3"
              onClick={() => setShowBudgetPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
