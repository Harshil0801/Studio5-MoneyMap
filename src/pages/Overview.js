  feature/multi-currency
import React, { useMemo, useState } from "react";
 
import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
  main

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

import { Doughnut, Line, Bar } from "react-chartjs-2";

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

  feature/multi-currency
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
 
  useEffect(() => {
    const loadTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "transactions"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => d.data());
      setTransactions(list);
    };

    loadTransactions();
  }, []);

  // ---------- helpers ----------
  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const s = String(val);
    const cleaned = s.replace(/[^0-9.]/g, ""); // removes $, +, -, text
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const getDateObj = (d) => {
    if (!d) return null;
    if (typeof d?.toDate === "function") return d.toDate(); // Firestore timestamp
    return new Date(d);
  };

  // ---------- chart options (responsive) ----------
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 14, boxHeight: 14 },
      },
      tooltip: { enabled: true },
    },
  };

  const lineOptions = {
    ...commonOptions,
    scales: {
      y: { beginAtZero: true },
    },
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      y: { beginAtZero: true },
    },
  };

  const doughnutOptions = {
    ...commonOptions,
    cutout: "60%",
 main
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
  // WEEKLY DATA (Bar)
  // ===================================
  const weeklyData = useMemo(() => {
    const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totals = new Array(7).fill(0);

    transactions.forEach((t) => {
  feature/multi-currency
      const d = toDateObj(t.date);
      const day = d.getDay(); // 0 Sun ... 6 Sat
      const i = day === 0 ? 6 : day - 1;
      totals[i] += toDisplayAmount(t);
 
      const d = getDateObj(t.date);
      if (!d || isNaN(d.getTime())) return;

      const day = d.getDay(); // 0 = Sun
      const i = day === 0 ? 6 : day - 1;
      totals[i] += toNumber(t.amount);
 main
    });

    return {
      labels: weekLabels,
      datasets: [
        {
feature/multi-currency
          label: `Weekly Total (${selectedCurrency})`,
          data: totals.map((x) => Number(x.toFixed(2))),
          backgroundColor: "#4c8bf5",
        },
      ],
    };
  }, [transactions, exchangeRate, selectedCurrency]);
 
          label: "Weekly Total ($)",
          data: totals,
          backgroundColor: "rgba(15, 118, 110, 0.75)",
          borderRadius: 10,
        },
      ],
    };
  }, [transactions]);
  main

  // ===================================
  // MONTHLY DATA (Line)
  // ===================================
  const monthlyData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const totals = new Array(12).fill(0);

    transactions.forEach((t) => {
  feature/multi-currency
      const d = toDateObj(t.date);
      totals[d.getMonth()] += toDisplayAmount(t);
 
      const d = getDateObj(t.date);
      if (!d || isNaN(d.getTime())) return;
      totals[d.getMonth()] += toNumber(t.amount);
 main
    });

    return {
      labels: months,
      datasets: [
        {
 feature/multi-currency
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
 
          label: "Monthly Total ($)",
          data: totals,
          borderColor: "rgba(15, 118, 110, 1)",
          backgroundColor: "rgba(15, 118, 110, 0.15)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [transactions]);
 main

  // ===================================
  // CUSTOM RANGE DATA (Line)
  // ===================================
  const customData = useMemo(() => {
    if (!customStart || !customEnd) return null;

    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

 feature/multi-currency
    const filtered = transactions.filter((t) => {
      const d = toDateObj(t.date);
      return d >= start && d <= end;
    });

    const labels = filtered.map((t) => toDateObj(t.date).toLocaleDateString());
    const amounts = filtered.map((t) => toDisplayAmount(t));
 
    const filtered = transactions
      .map((t) => ({ ...t, _d: getDateObj(t.date) }))
      .filter((t) => t._d && !isNaN(t._d.getTime()))
      .filter((t) => t._d >= start && t._d <= end)
      .sort((a, b) => a._d - b._d);

    const labels = filtered.map((t) => t._d.toLocaleDateString());
    const amounts = filtered.map((t) => toNumber(t.amount));
 main

    return {
      labels,
      datasets: [
        {
 feature/multi-currency
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
 
          label: "Custom Range ($)",
          data: amounts,
          borderColor: "rgba(124, 77, 255, 1)",
          backgroundColor: "rgba(124, 77, 255, 0.12)",
          tension: 0.35,
          fill: true,
          pointRadius: 2,
        },
      ],
    };
  }, [transactions, customStart, customEnd]);

  // ===================================
  // CATEGORY (Doughnut)
  // ===================================
  const doughnutData = useMemo(() => {
    const categories = ["Grocery", "Shopping", "Medicine", "Other"];
 main

    const totals = categories.map((cat) =>
      transactions
        .filter((t) => t.category === cat && t.type === "expense")
 feature/multi-currency
        .reduce((sum, t) => sum + toDisplayAmount(t), 0)
 
        .reduce((sum, t) => sum + toNumber(t.amount), 0)
 main
    );

    return {
      labels: categories,
      datasets: [
        {
 feature/multi-currency
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
 
          data: totals,
          backgroundColor: [
            "rgba(255, 107, 129, 0.85)",
            "rgba(76, 139, 245, 0.85)",
            "rgba(255, 214, 107, 0.85)",
            "rgba(46, 213, 115, 0.85)",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [transactions]);

  // choose main chart based on filter
  const mainChart = useMemo(() => {
    if (filterType === "weekly") {
      return { title: "Weekly Summary", type: "bar", data: weeklyData };
    }
    if (filterType === "custom") {
      return { title: "Custom Date Range", type: "line", data: customData };
    }
    return { title: "Monthly Summary", type: "line", data: monthlyData };
  }, [filterType, weeklyData, monthlyData, customData]);

  return (
    <div className="overview-section">
      <div style={{ textAlign: "left" }}>
        <h2 style={{ margin: 0, color: "#0b3b3a" }}>Overview</h2>
        <p style={{ marginTop: 6, color: "#5b6b6b" }}>
          Choose a view to see your spending and trends.
        </p>
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <div className="quick-filters">
          <button
            type="button"
            onClick={() => setFilterType("weekly")}
            className={filterType === "weekly" ? "active-filter" : ""}
          >
            Weekly
          </button>

          <button
            type="button"
            onClick={() => setFilterType("monthly")}
            className={filterType === "monthly" ? "active-filter" : ""}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setFilterType("custom")}
            className={filterType === "custom" ? "active-filter" : ""}
          >
            Custom Range
          </button>
        </div>

        {filterType === "custom" && (
          <div className="date-range">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* CHARTS (vertical stack) */}
      <div className="chart-container">
        {/* Doughnut */}
        <div className="pie-chart">
          <h3 style={{ marginTop: 0 }}>Spending by Category</h3>
          <div className="chart-box">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Main chart */}
        <div className="line-chart">
          <h3 style={{ marginTop: 0 }}>{mainChart.title}</h3>

          <div className="chart-box">
            {mainChart.type === "bar" && (
              <Bar data={mainChart.data} options={barOptions} />
            )}

            {mainChart.type === "line" && mainChart.data && (
              <Line data={mainChart.data} options={lineOptions} />
            )}

            {mainChart.type === "line" && !mainChart.data && (
              <div style={{ padding: 14, color: "#5b6b6b" }}>
                Select start and end date to view the chart.
              </div>
            )}
          </div>
        </div>
      </div>
  main
    </div>
  );
}

export default Overview;
