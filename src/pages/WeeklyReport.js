import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

function WeeklyReport({ exchangeRate = 1, selectedCurrency = "NZD" }) {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Helpers
  // -------------------------
  const safeNumber = (val) => {
    const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // ✅ Works for:
  // - Firestore Timestamp
  // - Date object
  // - ISO "2026-02-16"
  // - NZ "16/02/2026"
  // - "16-02-2026"
  const toDateObj = (d) => {
    try {
      if (!d) return null;

      // Firestore Timestamp
      if (d?.toDate) return d.toDate();

      // Already Date
      if (d instanceof Date) return d;

      // String formats
      const s = String(d).trim();
      if (!s) return null;

      // ISO format: 2026-02-16
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const iso = new Date(s);
        return isNaN(iso.getTime()) ? null : iso;
      }

      // DD/MM/YYYY or DD-MM-YYYY (NZ common)
      const parts = s.includes("/") ? s.split("/") : s.split("-");
      if (parts.length === 3) {
        const [p1, p2, p3] = parts.map((x) => parseInt(x, 10));
        if ([p1, p2, p3].some((x) => Number.isNaN(x))) return null;

        // If first part > 12 => DD/MM/YYYY
        let day = p1;
        let month = p2;
        let year = p3;

        // If it looks like MM/DD/YYYY (rare in NZ), swap
        if (p1 <= 12 && p2 > 12) {
          day = p2;
          month = p1;
        }

        const dt = new Date(year, month - 1, day);
        return isNaN(dt.getTime()) ? null : dt;
      }

      // fallback
      const normal = new Date(s);
      return isNaN(normal.getTime()) ? null : normal;
    } catch {
      return null;
    }
  };

  const formatDate = (d) => {
    const dt = toDateObj(d);
    return !dt || isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString();
  };

  // ✅ True multi-currency:
  // Prefer amountNZD if present, else fallback to amount.
  // Then convert NZD -> selectedCurrency with exchangeRate.
  const toDisplayAmount = (t) => {
    const baseNZD =
      t?.amountNZD != null ? safeNumber(t.amountNZD) : safeNumber(t.amount);
    return baseNZD * (exchangeRate || 1);
  };

  const fmtMoney = (n) => `${Number(n || 0).toFixed(2)} ${selectedCurrency}`;

  // -------------------------
  // Current week (Mon–Sun)
  // -------------------------
  const getCurrentWeekRange = () => {
    const today = new Date();
    const day = today.getDay(); // 0 Sun..6 Sat
    const diff = day === 0 ? -6 : 1 - day; // Monday start
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + diff
    );
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  // -------------------------
  // Fetch + filter
  // -------------------------
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

      // ✅ Filter by date range safely
      const filtered = all.filter((t) => {
        const dt = toDateObj(t.date);
        if (!dt) return false;
        return dt >= start && dt <= end;
      });

      // Sort newest first
      filtered.sort(
        (a, b) => (toDateObj(b.date)?.getTime() || 0) - (toDateObj(a.date)?.getTime() || 0)
      );

      const income = filtered
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + toDisplayAmount(t), 0);

      const expense = filtered
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + toDisplayAmount(t), 0);

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

  // -------------------------
  // UI Styles (clean)
  // -------------------------
  const card = {
    background: "white",
    border: "1px solid #dbe3ea",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: 5 }}>Weekly Report</h2>
      <p style={{ marginTop: 0, color: "#64748b", fontSize: 13 }}>
        Summary for the current week. Showing values in <b>{selectedCurrency}</b>.
      </p>

      <button
        onClick={handleThisWeek}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 12,
          background: "#4c8bf5",
          color: "#fff",
          border: "none",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Load This Week
      </button>

      {loading && <p style={{ marginTop: 12 }}>Loading...</p>}

      {dateRange.start && (
        <div style={{ ...card, marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
            Week Range
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
            {formatDate(dateRange.start)} — {formatDate(dateRange.end)}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginTop: 14,
            }}
          >
            <div style={card}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>
                Income
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, color: "#16a34a" }}>
                {fmtMoney(totals.income)}
              </div>
            </div>

            <div style={card}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>
                Expense
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, color: "#dc2626" }}>
                {fmtMoney(totals.expense)}
              </div>
            </div>

            <div style={card}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>
                Balance
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  marginTop: 6,
                  color: totals.balance >= 0 ? "#0ea5e9" : "#b45309",
                }}
              >
                {fmtMoney(totals.balance)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {dateRange.start && (
        <div style={{ ...card, marginTop: 14, padding: 0 }}>
          {transactions.length === 0 ? (
            <p style={{ padding: 16, margin: 0 }}>No data this week.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Date", "Description", "Category", "Type", `Amount (${selectedCurrency})`].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 14px",
                            textAlign: "left",
                            borderBottom: "1px solid #e2e8f0",
                            fontSize: 12,
                            fontWeight: 900,
                            color: "#0f172a",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((t) => {
                    const amt = toDisplayAmount(t);

                    return (
                      <tr key={t.id}>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7" }}>
                          {formatDate(t.date)}
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7" }}>
                          {t.description || "-"}
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7" }}>
                          {t.category || "-"}
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7" }}>
                          {t.type || "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            borderBottom: "1px solid #eef2f7",
                            fontWeight: 900,
                            color: t.type === "income" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {t.type === "income" ? "+" : "-"} {fmtMoney(amt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WeeklyReport;
