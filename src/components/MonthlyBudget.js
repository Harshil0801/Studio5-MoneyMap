import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function MonthlyBudget({
  allTransactions = [],
  exchangeRate = 1,
  selectedCurrency = "NZD",
}) {
  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [editing, setEditing] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const safeNumber = (val) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    const cleaned = String(val).replace(/[^0-9.-]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const toDateObj = (d) => {
    try {
      if (d?.toDate) return d.toDate(); // Firestore Timestamp
      return new Date(d);
    } catch {
      return new Date();
    }
  };

  /**
   * ✅ True multi-currency:
   * Use amountNZD if present; fallback to amount for old docs.
   */
  const getNZDAmount = (t) => {
    if (t?.amountNZD != null) return safeNumber(t.amountNZD);
    return safeNumber(t.amount);
  };

  // Load saved budget (stored in NZD)
  useEffect(() => {
    const fetchBudget = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data().monthlyBudget != null) {
        setSavedBudget(safeNumber(snap.data().monthlyBudget));
      }
    };

    fetchBudget();
  }, []);

  // Calculate remaining (savedBudget - monthly expenses) in NZD
  useEffect(() => {
    if (!allTransactions || savedBudget == null) return;

    const monthlyExpensesNZD = allTransactions
      .filter((t) => t.type === "expense")
      .filter((t) => {
        const date = toDateObj(t.date);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      })
      .reduce((sum, t) => sum + getNZDAmount(t), 0);

    setRemaining(savedBudget - monthlyExpensesNZD);
  }, [allTransactions, selectedMonth, selectedYear, savedBudget]);

  // Save budget (store in NZD)
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first.");

    const userRef = doc(db, "users", user.uid);

    const nzdBudget = safeNumber(budget);
    if (!nzdBudget || nzdBudget <= 0) {
      return alert("Please enter a valid budget amount.");
    }

    await updateDoc(userRef, {
      monthlyBudget: nzdBudget,
    });

    setSavedBudget(nzdBudget);
    setEditing(false);
    alert("Budget updated!");
  };

  // Convert for display only
  const displayBudget = savedBudget == null ? 0 : savedBudget * (exchangeRate || 1);
  const displayRemaining = remaining * (exchangeRate || 1);

  // Dynamic year options (current year ±2)
  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="card p-4 mt-4">
      <h4 className="text-center">Monthly Budget</h4>

      {/* Month & Year Selector */}
      <div className="d-flex gap-3 mb-3">
        <select
          className="form-control"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {months.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Input (entered/stored in NZD internally) */}
      <input
        type="number"
        className="form-control mb-3"
        placeholder="Enter budget (stored in NZD)"
        value={editing ? budget : savedBudget ?? ""}
        onChange={(e) => setBudget(e.target.value)}
        disabled={!editing}
        min="0"
        step="0.01"
      />

      {editing ? (
        <button className="btn btn-success w-100" onClick={handleSave}>
          Save Budget
        </button>
      ) : (
        <button
          className="btn btn-warning w-100"
          onClick={() => {
            setBudget(savedBudget ?? "");
            setEditing(true);
          }}
        >
          Edit Budget
        </button>
      )}

      {/* Summary */}
      {savedBudget !== null && (
        <div className="text-center mt-3">
          <h5>
            Saved Budget: {displayBudget.toFixed(2)} {selectedCurrency}
          </h5>
          <h6 className={displayRemaining < 0 ? "text-danger" : "text-success"}>
            Remaining: {displayRemaining.toFixed(2)} {selectedCurrency}
          </h6>

          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            Note: Budget is stored in NZD. Expenses are calculated using amountNZD when available.
          </p>
        </div>
      )}
    </div>
  );
}

export default MonthlyBudget;
