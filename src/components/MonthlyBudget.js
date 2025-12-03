import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function MonthlyBudget({ allTransactions }) {
  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [editing, setEditing] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Load saved budget
  useEffect(() => {
    const fetchBudget = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data().monthlyBudget) {
        setSavedBudget(snap.data().monthlyBudget);
      }
    };

    fetchBudget();
  }, []);

  // FIXED — Calculate expenses
  useEffect(() => {
    if (!allTransactions || savedBudget == null) return;

    const monthlyExpenses = allTransactions
      .filter((t) => t.type === "expense")
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      })
      .reduce((sum, t) => {
        let amt = t.amount;

        // FIX: if amount is number → convert to string
        if (typeof amt === "number") {
          amt = amt.toString();
        }

        // FIX: safely clean symbols
        amt = amt.replace("$", "").replace("+", "").replace("-", "");

        return sum + Number(amt);
      }, 0);

    setRemaining(savedBudget - monthlyExpenses);
  }, [allTransactions, selectedMonth, selectedYear, savedBudget]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first.");

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      monthlyBudget: Number(budget),
    });

    setSavedBudget(Number(budget));
    setEditing(false);
    alert("Budget updated!");
  };

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
          {Array.from({ length: 6 }, (_, i) => 2023 + i).map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Budget Input */}
      <input
        type="number"
        className="form-control mb-3"
        placeholder="Enter budget"
        value={editing ? budget : savedBudget ?? ""}
        onChange={(e) => setBudget(e.target.value)}
        disabled={!editing}
      />

      {editing ? (
        <button className="btn btn-success w-100" onClick={handleSave}>
          Save Budget
        </button>
      ) : (
        <button
          className="btn btn-warning w-100"
          onClick={() => {
            setBudget(savedBudget);
            setEditing(true);
          }}
        >
          Edit Budget
        </button>
      )}

      {/* Summary */}
      {savedBudget !== null && (
        <div className="text-center mt-3">
          <h5>Saved Budget: ${savedBudget}</h5>
          <h6 className={remaining < 0 ? "text-danger" : "text-success"}>
            Remaining: ${remaining}
          </h6>
        </div>
      )}
    </div>
  );
}

export default MonthlyBudget;
