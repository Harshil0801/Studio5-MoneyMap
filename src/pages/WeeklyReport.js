import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

const WeeklyReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(false);

  const parseDate = (str) => {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d) ? null : d;
  };

  // Get current week (Mon–Sun)
  const getCurrentWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  const fetchWeeklyReport = async (start, end) => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid)
      );

      const snap = await getDocs(q);
      const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const filtered = all.filter((t) => {
        const d = parseDate(t.date);
        if (!d) return false;
        return d >= start && d <= end;
      });

      const income = filtered
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = filtered
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setTotals({ income, expense, balance: income - expense });
      setTransactions(filtered);
      setDateRange({ start, end });
    } finally {
      setLoading(false);
    }
  };

  const handleThisWeek = () => {
    const range = getCurrentWeekRange();
    fetchWeeklyReport(range.start, range.end);
  };

  const formatDate = (d) => (d ? d.toLocaleDateString() : "");

  return (
    <div style={{ padding: "20px" }}>
      <h2>Weekly Report</h2>
      <p>View your financial summary for the current week.</p>

      <button
        onClick={handleThisWeek}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          background: "#4c8bf5",
          color: "#fff",
          border: "none",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Load This Week
      </button>

      {loading && <p>Loading...</p>}

      {dateRange.start && (
        <div style={{ marginTop: "20px" }}>
          <h3>
            Week: {formatDate(dateRange.start)} — {formatDate(dateRange.end)}
          </h3>
          <p><strong>Total Income:</strong> ${totals.income}</p>
          <p><strong>Total Expense:</strong> ${totals.expense}</p>
          <p
            style={{
              fontWeight: "bold",
              color: totals.balance >= 0 ? "green" : "red",
            }}
          >
            Balance: ${totals.balance}
          </p>
        </div>
      )}

      {transactions.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Date</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Description</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Category</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Type</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.date}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.description}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.category}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.type}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {t.type === "income" ? "+" : "-"}${Number(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dateRange.start && transactions.length === 0 && <p>No data this week.</p>}
    </div>
  );
};

export default WeeklyReport;
