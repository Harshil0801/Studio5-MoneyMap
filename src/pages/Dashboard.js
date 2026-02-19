 feature/multi-currency
import React, { useState, useEffect, useCallback } from "react";
 
import React, { useState, useEffect } from "react";
  main
import { Link } from "react-router-dom";

import History from "./History";
import Overview from "./Overview";
import AddTransaction from "./AddTransaction";
import WeeklyReport from "./WeeklyReport";
import GenerateQR from "./GenerateQR";
import MonthlyBudget from "../components/MonthlyBudget";
  feature/multi-currency
import CurrencyConverterWidget from "../components/CurrencyConverterWidget";
  main

import "../styles/Dashboard.css";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, getDocs, doc, setDoc } from "firebase/firestore";

import {
  getRate,
  getRatesTable,
  refreshRates,
  getCachedTimestamp,
  getNextRefreshInMs,
  formatMsToHours,
} from "../utils/exchangeRateService";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);

  feature/multi-currency
  // Auth
  const [userUid, setUserUid] = useState(null);

  // Multi-currency
  const [selectedCurrency, setSelectedCurrency] = useState("NZD");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [rateUpdatedAt, setRateUpdatedAt] = useState(null);

  // rate metadata
  const [rateStatus, setRateStatus] = useState("CACHED"); // LIVE/CACHED/STALE/OFFLINE
  const [nextRefreshInMs, setNextRefreshInMs] = useState(null);

  // Budget popup
  main
  const [showBudgetPopup, setShowBudgetPopup] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [popupShownOnce, setPopupShownOnce] = useState(false);

  feature/multi-currency
  // ===========================
  // AUTH LISTENER + LOAD PREFS
  // ===========================
  main
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUserUid(null);
        setSelectedCurrency("NZD");
        return;
      }

      setUserUid(u.uid);

      try {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const pref = snap.data()?.preferredCurrency;
          if (pref) setSelectedCurrency(pref);
        }
      } catch (e) {
        console.log("Failed to load preferred currency:", e);
      }
    });

    return () => unsub();
  }, []);

 feature/multi-currency
  // ===========================
  // FETCH TRANSACTIONS
  // ===========================
  const fetchTransactions = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) return;

    const ref = collection(db, "transactions");
    const snap = await getDocs(ref);

    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((t) => t.uid === u.uid);
 
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
  main

    setTransactions(list);
  }, []);

 feature/multi-currency
  useEffect(() => {
    if (!userUid) return;
    fetchTransactions();
  }, [userUid, fetchTransactions]);

  // ===========================
  // SAVE PREFERRED CURRENCY
  // ===========================
  const persistPreferredCurrency = useCallback(
    async (currency) => {
      if (!userUid) return;
      try {
        const userRef = doc(db, "users", userUid);
        await setDoc(userRef, { preferredCurrency: currency }, { merge: true });
      } catch (e) {
        console.log("Failed to save preferred currency:", e);
      }
    },
    [userUid]
  );

  // ===========================
  // LOAD EXCHANGE RATE (CACHED)
  // ===========================
  useEffect(() => {
    const loadRate = async () => {
      try {
        const table = await getRatesTable();
        setRateStatus(table.status || "CACHED");

        const ts = table.timestamp || getCachedTimestamp();
        setRateUpdatedAt(ts || null);

        const rate = await getRate(selectedCurrency);
        setExchangeRate(rate);

        const nextMs = ts ? getNextRefreshInMs(ts) : null;
        setNextRefreshInMs(nextMs);
      } catch (e) {
        console.log("Exchange rate error:", e);
        setRateStatus("OFFLINE");
        setExchangeRate(1);
        setRateUpdatedAt(getCachedTimestamp());
      }
    };

    loadRate();
  }, [selectedCurrency]);

  // ===========================
  // CALCULATE REMAINING BUDGET
  // ===========================
  main
  useEffect(() => {
    const calculateRemaining = async () => {
      if (popupShownOnce) return;

      const user = auth.currentUser;
      if (!user) return;

 feature/multi-currency
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return;

      const savedBudget = snap.data().monthlyBudget;
      if (!savedBudget) return;

      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      const monthlyExpensesNZD = transactions
        .filter((t) => t.type === "expense")
        .filter((t) => {
          let d = t.date;
          if (d && typeof d.toDate === "function") d = d.toDate();
          else d = new Date(d);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, t) => {
          const val = t.amountNZD != null ? t.amountNZD : t.amount;
          const cleaned = String(val).replace(/[^0-9.-]/g, "");
          const num = parseFloat(cleaned);
          return sum + (isNaN(num) ? 0 : num);
        }, 0);

      const remainingNZD = Number(savedBudget) - monthlyExpensesNZD;

      setRemainingBudget(remainingNZD);
      setShowBudgetPopup(true);
      setPopupShownOnce(true);
 
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
  main
    };

    if (transactions.length > 0) calculateRemaining();
  }, [transactions, popupShownOnce]);

  return (
  feature/multi-currency
    <div className="dashboard-container">
      <div className="dashboard-shell">
        {/* HEADER */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Here is your financial summary</p>
          </div>

          <Link to="/update-profile" className="profile-link">
 
    <div className="dash-page">
      <div className="dash-shell">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-subtitle">Your finance overview in one place</p>
          </div>

          <Link to="/update-profile" className="dash-link">
  main
            Account Settings
          </Link>
        </div>

  feature/multi-currency
        {/* TOP GRID */}
        <div className="dashboard-topgrid">
          {/* Currency + Exchange */}
          <div className="dashboard-card">
            <div className="card-title">Currency & Exchange Rates</div>

            <div className="field-row">
              <div className="field-col">
                <label className="field-label">Display Currency</label>
                <select
                  className="field-control"
                  value={selectedCurrency}
                  onChange={(e) => {
                    const cur = e.target.value;
                    setSelectedCurrency(cur);
                    persistPreferredCurrency(cur);
                  }}
                >
                  <option value="NZD">NZD - New Zealand Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                </select>
              </div>
            </div>

            <div className="exchange-bar">
              <div className="exchange-left">
                <div className="exchange-title">
                  Base <b>NZD</b> → <b>{selectedCurrency}</b>
                </div>

                <span className={`status-pill status-${String(rateStatus).toLowerCase()}`}>
                  {rateStatus}
                </span>

                {rateStatus === "OFFLINE" && (
                  <span className="offline-text">Offline: using saved rates</span>
                )}
              </div>

              <div className="exchange-mid">
                1 NZD = <b>{Number(exchangeRate || 1).toFixed(4)}</b>{" "}
                {selectedCurrency}
              </div>

              <div className="exchange-right">
                <div className="exchange-meta">
                  {rateUpdatedAt && (
                    <span>Updated: {new Date(rateUpdatedAt).toLocaleString()}</span>
                  )}
                  {rateUpdatedAt && nextRefreshInMs != null && (
                    <span>Next refresh: {formatMsToHours(nextRefreshInMs)}</span>
                  )}
                </div>

                <button
                  className="btn-outline"
                  onClick={async () => {
                    try {
                      await refreshRates();
                      const rate = await getRate(selectedCurrency);
                      setExchangeRate(rate);

                      const table = await getRatesTable({ forceRefresh: false });
                      setRateStatus(table.status || "LIVE");

                      const ts = getCachedTimestamp();
                      setRateUpdatedAt(ts);
                      setNextRefreshInMs(ts ? getNextRefreshInMs(ts) : null);
                    } catch (e) {
                      console.log(e);
                      setRateStatus("OFFLINE");
                    }
                  }}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Converter */}
          <div className="dashboard-card">
            <div className="card-title">Quick Currency Converter</div>
            <CurrencyConverterWidget defaultTo={selectedCurrency} />
          </div>
        </div>

        {/* TABS */}
        <div className="dashboard-tabs pro-tabs">
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

        {/* CONTENT */}
        <div className="dashboard-content pro-content">
          {activeTab === "overview" && (
            <Overview
              transactions={transactions}
              exchangeRate={exchangeRate}
              selectedCurrency={selectedCurrency}
            />
          )}

          {activeTab === "history" && (
            <History
              transactions={transactions}
              exchangeRate={exchangeRate}
              selectedCurrency={selectedCurrency}
            />
          )}

          {activeTab === "add" && (
            <AddTransaction
              selectedCurrency={selectedCurrency}
              onTransactionAdded={fetchTransactions}
            />
          )}

          {activeTab === "weekly" && (
            <WeeklyReport
              exchangeRate={exchangeRate}
              selectedCurrency={selectedCurrency}
            />
          )}

          {activeTab === "qr" && <GenerateQR />}
        </div>

        {/* MONTHLY BUDGET */}
        {activeTab === "overview" && (
          <MonthlyBudget
            allTransactions={transactions}
            exchangeRate={exchangeRate}
            selectedCurrency={selectedCurrency}
          />
        )}

        {/* POPUP */}
        {showBudgetPopup && remainingBudget !== null && (
          <div className="budget-popup">
            <div className="popup-content">
              <h4>Budget Reminder</h4>
              <p>Your remaining budget for this month is:</p>
              <h2 className={remainingBudget < 0 ? "text-danger" : "text-success"}>
                {(remainingBudget * exchangeRate).toFixed(2)} {selectedCurrency}
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
  main
    </div>
  );
};

export default Dashboard;
