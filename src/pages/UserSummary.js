import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const UserSummary = () => {
  const [summary, setSummary] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(true);

  const search = useLocation().search;
  const uid = new URLSearchParams(search).get("uid");

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      const q = query(collection(db, "transactions"), where("uid", "==", uid));
      const snap = await getDocs(q);

      const all = snap.docs.map(doc => doc.data());

      // Calculate totals
      const income = all
        .filter(t => t.type === "income")
        .reduce((a, b) => a + Number(b.amount), 0);

      const expense = all
        .filter(t => t.type === "expense")
        .reduce((a, b) => a + Number(b.amount), 0);

      const balance = income - expense;

      setSummary({ income, expense, balance });

      // AI-like saving suggestions
      if (balance < 0) {
        setSuggestion("⚠️ You overspent this week. Try reducing shopping and food delivery.");
      } else if (balance < 100) {
        setSuggestion("👍 You saved a little. Try limiting impulse purchases to increase savings.");
      } else if (balance >= 100) {
        setSuggestion("🎉 Great job saving! Consider adding $20–$50 into your savings account.");
      }

      setLoading(false);
    };

    fetchData();
  }, [uid]);

  if (loading) return <p style={{ padding: "20px" }}>Loading summary...</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Your Financial Summary</h2>

      <div style={{ marginTop: "20px", fontSize: "18px" }}>
        <p><strong>Total Income:</strong> ${summary.income}</p>
        <p><strong>Total Expense:</strong> ${summary.expense}</p>
        <p
          style={{
            fontWeight: "bold",
            color: summary.balance >= 0 ? "green" : "red",
          }}
        >
          Balance: ${summary.balance}
        </p>
      </div>

      <h3 style={{ marginTop: "20px" }}>Saving Suggestions</h3>
      <p style={{ fontSize: "16px" }}>{suggestion}</p>
    </div>
  );
};

export default UserSummary;
