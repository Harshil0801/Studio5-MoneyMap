import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "../styles/Dashboard.css";

import { getRatesTable } from "../utils/exchangeRateService";

const AddTransaction = ({ selectedCurrency = "NZD", onTransactionAdded }) => {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState(selectedCurrency); // ✅ default from dashboard
  const [saving, setSaving] = useState(false);

  const detectCategory = (desc) => {
    const d = (desc || "").toLowerCase();
    if (d.includes("grocery") || d.includes("food")) return "Grocery";
    if (d.includes("medicine") || d.includes("pharmacy")) return "Medicine";
    if (d.includes("shop") || d.includes("clothes")) return "Shopping";
    if (d.includes("rent")) return "Rent";
    if (d.includes("fuel") || d.includes("petrol") || d.includes("gas")) return "Transport";
    return "Other";
  };

  // Convert entered currency -> NZD using rates where 1 NZD = rates[CUR]
  const convertToNZD = (amountValue, rates, fromCurrency) => {
    const amt = Number(amountValue);
    if (!amt || isNaN(amt)) return 0;
    if (!fromCurrency || fromCurrency === "NZD") return amt;

    const rate = rates?.[fromCurrency];
    if (!rate || rate === 0) return amt; // fallback

    // If 1 NZD = 0.61 USD then 1 USD = 1/0.61 NZD
    return amt * (1 / rate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in!");
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const category = type === "expense" ? detectCategory(description) : "Income";

    try {
      setSaving(true);

      // ✅ get rates once (cached/offline supported)
      const table = await getRatesTable();
      const rates = table?.rates || { NZD: 1 };

      const amountNZD = convertToNZD(numericAmount, rates, currency);

      await addDoc(collection(db, "transactions"), {
        uid: user.uid,

        // original entry
        amount: Number(numericAmount.toFixed(2)),
        currency,
        description,
        category,
        type,

        // ✅ normalized base for accurate totals
        amountNZD: Number(amountNZD.toFixed(2)),

        // ✅ store real date object (Firestore Timestamp)
        date: new Date(),
      });

      alert(`${type} added successfully!`);

      // Clear fields
      setAmount("");
      setDescription("");

      // refresh dashboard list
      if (typeof onTransactionAdded === "function") {
        await onTransactionAdded();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      {/* ✅ Currency selector per transaction */}
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="NZD">NZD - New Zealand Dollar</option>
        <option value="USD">USD - US Dollar</option>
        <option value="AUD">AUD - Australian Dollar</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="INR">INR - Indian Rupee</option>
        <option value="CAD">CAD - Canadian Dollar</option>
        <option value="SGD">SGD - Singapore Dollar</option>
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min="0"
        step="0.01"
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add"}
      </button>
    </form>
  );
};

export default AddTransaction;
