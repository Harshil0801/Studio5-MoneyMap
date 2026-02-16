import React, { useMemo, useState } from "react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
} from "chart.js";

import { Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement
);

function Overview({ transactions = [], exchangeRate = 1, selectedCurrency = "NZD" }) {
  const [filterType, setFilterType] = useState("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const safeNumber = (val) => {
    if (val == null) return 0;
    if (typeof val === "number") return val;
    const cleaned = String(val).replace(/[^0-9.-]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const toDateObj = (d) => {
    try {
      if (d?.toDate) return d.toDate();
      return new Date(d);
    } catch {
      return new Date();
    }
  };

  /**
   * ✅ True multi-currency:
   * Prefer amountNZD (normalized base) if available.
   * Else fallback to old amount.
   * Then convert NZD -> selectedCurrency using exchangeRate.
   */
  const toDisplayAmount = (t) => {
    const baseNZD =
      t?.amountNZD != null ? safeNumber(t.amountNZD) : safeNumber(t.amount);
    return baseNZD * (exchangeRate || 1);
  };

  const money = (n) =>
    `${Number(n || 0).toFixed(2)} ${selectedCurrency}`;

  // ==========================
  // SUMMARY CARDS (Income/Expense/Balance)
  // ==========================
  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + toDisplayAmount(t), 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + toDisplayAmount(t), 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions, exchangeRate]);

  // ===================================
  // WEEKLY DATA
  // ===================================
  const weeklyData = useMemo(() => {
    const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totals = new Array(7).fill(0);

    transactions.forEach((t) => {
      const d = toDateObj(t.date);
      const day = d.getDay(); // 0 Sun ... 6 Sat
      const i = day === 0 ? 6 : day - 1;
      totals[i] += toDisplayAmount(t);
    });

    return {
      labels: weekLabels,
      datasets: [
        {
          label: `Weekly Total (${selectedCurrency})`,
          data: totals.map((x) => Number(x.toFixed(2))),
          backgroundColor: "#4c8bf5",
        },
      ],
    };
  }, [transactions, exchangeRate, selectedCurrency]);

  // ===================================
  // MONTHLY DATA
  // ===================================
  const monthlyData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const totals = new Array(12).fill(0);

    transactions.forEach((t) => {
      const d = toDateObj(t.date);
      totals[d.getMonth()] += toDisplayAmount(t);
    });

    return {
      labels: months,
      datasets: [
        {
          label: `Monthly Total (${selectedCurrency})`,
          data: totals.map((x) => Number(x.toFixed(2))),
          borderColor: "#4c8bf5",
          backgroundColor: "rgba(76,139,245,0.2)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [transactions, exchangeRate, selectedCurrency]);

  // ===================================
  // CUSTOM DATE RANGE DATA
  // ===================================
  const customData = useMemo(() => {
    if (!customStart || !customEnd) return null;

    const start = new Date(customStart);
    const end = new Date(customEnd);

    const filtered = transactions.filter((t) => {
      const d = toDateObj(t.date);
      return d >= start && d <= end;
    });

    const labels = filtered.map((t) => toDateObj(t.date).toLocaleDateString());
    const amounts = filtered.map((t) => toDisplayAmount(t));

    return {
      labels,
      datasets: [
        {
          label: `Custom Range (${selectedCurrency})`,
          data: amounts.map((x) => Number(x.toFixed(2))),
          borderColor: "#7c4dff",
          backgroundColor: "rgba(124,77,255,0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [customStart, customEnd, transactions, exchangeRate, selectedCurrency]);

  // ===================================
  // PIE CHART (CATEGORY-WISE EXPENSES)
  // ===================================
  const pieData = useMemo(() => {
    const categories = ["Grocery","Shopping","Medicine","Other","Rent","Transport"];

    const totals = categories.map((cat) =>
      transactions
        .filter((t) => t.category === cat && t.type === "expense")
        .reduce((sum, t) => sum + toDisplayAmount(t), 0)
    );

    return {
      labels: categories,
      datasets: [
        {
          data: totals.map((x) => Number(x.toFixed(2))),
          backgroundColor: ["#ff6b81","#4c8bf5","#ffd66b","#2ed573","#ffa502","#3742fa"],
        },
      ],
    };
  }, [transactions, exchangeRate, selectedCurrency]);

  // Small shared styles (clean, not heavy)
  const pillBtn = (active) => ({
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #dbe3ea",
    background: active ? "#004d4d" : "white",
    color: active ? "white" : "#0f172a",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
  });

  const card = {
    background: "white",
    border: "1px solid #dbe3ea",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
  };

  return (
    <div className="overview-page" style={{ padding: "8px" }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0, color: "#0f172a" }}>Overview</h2>
        <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13 }}>
          Showing analytics in <b>{selectedCurrency}</b> (multi-currency safe).
        </p>
      </div>

      {/* ✅ Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          margin: "14px 0",
        }}
      >
        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>Total Income</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6, color: "#16a34a" }}>
            {money(summary.income)}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>Total Expense</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6, color: "#dc2626" }}>
            {money(summary.expense)}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>Balance</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              marginTop: 6,
              color: summary.balance >= 0 ? "#0ea5e9" : "#b45309",
            }}
          >
            {money(summary.balance)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          margin: "10px 0 14px 0",
        }}
      >
        <button onClick={() => setFilterType("weekly")} style={pillBtn(filterType === "weekly")}>
          Weekly
        </button>
        <button onClick={() => setFilterType("monthly")} style={pillBtn(filterType === "monthly")}>
          Monthly
        </button>
        <button onClick={() => setFilterType("custom")} style={pillBtn(filterType === "custom")}>
          Custom Range
        </button>

        {filterType === "custom" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: 10,
                border: "1px solid #dbe3ea",
              }}
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: 10,
                border: "1px solid #dbe3ea",
              }}
            />
          </div>
        )}
      </div>

      {/* ✅ Chart Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Pie Card */}
        <div style={card}>
          <div style={{ fontWeight: 900, marginBottom: 10, color: "#0f172a" }}>
            Spending by Category ({selectedCurrency})
          </div>
          <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
            <Pie data={pieData} />
          </div>
        </div>

        {/* Trend Card */}
        <div style={card}>
          <div style={{ fontWeight: 900, marginBottom: 10, color: "#0f172a" }}>
            {filterType === "weekly"
              ? "Weekly Summary"
              : filterType === "monthly"
              ? "Monthly Summary"
              : "Custom Date Range"}
          </div>

          {filterType === "weekly" && <Bar data={weeklyData} />}
          {filterType === "monthly" && <Line data={monthlyData} />}
          {filterType === "custom" && customStart && customEnd && customData && (
            <Line data={customData} />
          )}

          {filterType === "custom" && (!customStart || !customEnd) && (
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Select a start and end date to view custom analytics.
            </p>
          )}
        </div>
      </div>

      {/* Responsive fallback */}
      <div style={{ marginTop: 14, color: "#64748b", fontSize: 12 }}>
        Tip: Add more transactions in different currencies to see analytics update.
      </div>

      <style>{`
        @media (max-width: 900px) {
          .overview-page > div[style*="grid-template-columns: 420px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 720px) {
          .overview-page > div[style*="repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Overview;
