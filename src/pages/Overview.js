import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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

function Overview() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

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
  };

  // ===================================
  // WEEKLY DATA (Bar)
  // ===================================
  const weeklyData = useMemo(() => {
    const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totals = new Array(7).fill(0);

    transactions.forEach((t) => {
      const d = getDateObj(t.date);
      if (!d || isNaN(d.getTime())) return;

      const day = d.getDay(); // 0 = Sun
      const i = day === 0 ? 6 : day - 1;
      totals[i] += toNumber(t.amount);
    });

    return {
      labels: weekLabels,
      datasets: [
        {
          label: "Weekly Total ($)",
          data: totals,
          backgroundColor: "rgba(15, 118, 110, 0.75)",
          borderRadius: 10,
        },
      ],
    };
  }, [transactions]);

  // ===================================
  // MONTHLY DATA (Line)
  // ===================================
  const monthlyData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const totals = new Array(12).fill(0);

    transactions.forEach((t) => {
      const d = getDateObj(t.date);
      if (!d || isNaN(d.getTime())) return;
      totals[d.getMonth()] += toNumber(t.amount);
    });

    return {
      labels: months,
      datasets: [
        {
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

  // ===================================
  // CUSTOM RANGE DATA (Line)
  // ===================================
  const customData = useMemo(() => {
    if (!customStart || !customEnd) return null;

    const start = new Date(customStart);
    const end = new Date(customEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const filtered = transactions
      .map((t) => ({ ...t, _d: getDateObj(t.date) }))
      .filter((t) => t._d && !isNaN(t._d.getTime()))
      .filter((t) => t._d >= start && t._d <= end)
      .sort((a, b) => a._d - b._d);

    const labels = filtered.map((t) => t._d.toLocaleDateString());
    const amounts = filtered.map((t) => toNumber(t.amount));

    return {
      labels,
      datasets: [
        {
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

    const totals = categories.map((cat) =>
      transactions
        .filter((t) => t.category === cat && t.type === "expense")
        .reduce((sum, t) => sum + toNumber(t.amount), 0)
    );

    return {
      labels: categories,
      datasets: [
        {
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
    </div>
  );
}

export default Overview;
