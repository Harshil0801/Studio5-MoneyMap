import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

  const [showBudgetPopup, setShowBudgetPopup] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [popupShownOnce, setPopupShownOnce] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const ref = collection(db, "transactions");
        const snap = await getDocs(ref);

        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((t) => t.uid === user.uid);

        setTransactions(list);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const calculateRemaining = async () => {
      if (popupShownOnce) return;

      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;

        const savedBudget = snap.data().monthlyBudget;
        if (!savedBudget) return;

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const monthlyExpenses = transactions
          .filter((t) => t.type === "expense")
          .filter((t) => {
            let d = t.date;
            if (d && typeof d.toDate === "function") d = d.toDate();
            else d = new Date(d);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((sum, t) => {
            let amt = t.amount;
            if (typeof amt !== "string") amt = String(amt);
            amt = parseFloat(amt.replace(/[^0-9.]/g, ""));
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0);

        setRemainingBudget(Number(savedBudget) - monthlyExpenses);
        setShowBudgetPopup(true);
        setPopupShownOnce(true);
      } catch (err) {
        console.error(err);
      }
    };

    if (transactions.length > 0) calculateRemaining();
  }, [transactions, popupShownOnce]);

  return (
    <div className="dash-page">
      <div className="dash-shell">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Your finance overview in one place</p>
          </div>

          <Link to="/update-profile" className="dash-link">
            Account Settings
          </Link>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {[
            ["overview", "Overview"],
            ["history", "History"],
            ["add", "Add Transaction"],
            ["weekly", "Weekly Report"],
            ["qr", "QR Generator"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`dash-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="dash-content">
          {activeTab === "overview" && (
            <>
              <div className="dash-card">
                <Overview />
              </div>

              <div className="dash-card">
                <MonthlyBudget allTransactions={transactions} />
              </div>
            </>
          )}

          {activeTab === "history" && (
            <div className="dash-card">
              <History />
            </div>
          )}

          {activeTab === "add" && (
            <div className="dash-card">
              <AddTransaction />
            </div>
          )}

          {activeTab === "weekly" && (
            <div className="dash-card">
              <WeeklyReport />
            </div>
          )}

          {activeTab === "qr" && (
            <div className="dash-card">
              <GenerateQR />
            </div>
          )}
        </div>
      </div>

      {/* Popup */}
      {showBudgetPopup && remainingBudget !== null && (
        <div className="dash-modal" onClick={() => setShowBudgetPopup(false)}>
          <div className="dash-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="dash-modal-title">Budget Reminder</h3>
            <p className="dash-modal-text">Remaining budget this month</p>

            <div
              className={`dash-modal-amount ${
                remainingBudget < 0 ? "danger" : "success"
              }`}
            >
              ${Number(remainingBudget).toFixed(2)}
            </div>

            <button
              className="dash-modal-btn"
              onClick={() => setShowBudgetPopup(false)}
              type="button"
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
