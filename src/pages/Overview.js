import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement
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

function Overview() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "transactions"), where("uid", "==", user.uid));
    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => doc.data());
    setTransactions(list);
  };

  // ===================================
  // WEEKLY DATA
  // ===================================
  const getWeeklyData = () => {
    const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const totals = new Array(7).fill(0);

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const day = d.getDay();
      const i = day === 0 ? 6 : day - 1; // Sunday → index 6
      totals[i] += Number(t.amount);
    });

    return {
      labels: weekLabels,
      datasets: [
        {
          label: "Weekly Total ($)",
          data: totals,
          backgroundColor: "#ff6b81",
        },
      ],
    };
  };

  // ===================================
  // MONTHLY DATA
  // ===================================
  const getMonthlyData = () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const totals = new Array(12).fill(0);

    transactions.forEach((t) => {
      const d = new Date(t.date);
      totals[d.getMonth()] += Number(t.amount);
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Monthly Total ($)",
          data: totals,
          borderColor: "#4c8bf5",
          backgroundColor: "rgba(76,139,245,0.2)",
          tension: 0.4,
        },
      ],
    };
  };

  // ===================================
  // CUSTOM DATE RANGE DATA
  // ===================================
  const getCustomData = () => {
    if (!customStart || !customEnd) return null;

    const start = new Date(customStart);
    const end = new Date(customEnd);

    const filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    const labels = filtered.map((t) => t.date);
    const amounts = filtered.map((t) => Number(t.amount));

    return {
      labels,
      datasets: [
        {
          label: "Custom Range ($)",
          data: amounts,
          borderColor: "#7c4dff",
          backgroundColor: "rgba(124,77,255,0.2)",
          tension: 0.3,
        },
      ],
    };
  };

  // ===================================
  // PIE CHART (CATEGORY-WISE)
  // ===================================
  const categories = ["Grocery", "Shopping", "Medicine", "Other"];

  const categoryTotals = categories.map((cat) =>
    transactions
      .filter((t) => t.category === cat && t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)
  );

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categoryTotals,
        backgroundColor: [
          "#ff6b81", 
          "#4c8bf5", 
          "#ffd66b", 
          "#2ed573"
        ],
      },
    ],
  };

  return (
    <div className="overview-page" style={{ padding: "20px" }}>
      <h2>Overview</h2>
      <p>Select how you want to view your financial charts.</p>

      {/* FILTER BUTTONS */}
      <div style={{ marginBottom: "25px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setFilterType("weekly")}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            background: filterType === "weekly" ? "#4c8bf5" : "#e3e3e3",
            color: filterType === "weekly" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Weekly
        </button>

        <button
          onClick={() => setFilterType("monthly")}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            background: filterType === "monthly" ? "#4c8bf5" : "#e3e3e3",
            color: filterType === "monthly" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Monthly
        </button>

        <button
          onClick={() => setFilterType("custom")}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            background: filterType === "custom" ? "#4c8bf5" : "#e3e3e3",
            color: filterType === "custom" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Custom Range
        </button>
      </div>

      {/* CUSTOM DATE PICKERS */}
      {filterType === "custom" && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}

      {/* PIE CHART */}
      <div style={{ width: "350px", margin: "40px auto" }}>
        <h3>Spending by Category</h3>
        <Pie data={pieData} />
      </div>

      {/* WEEKLY CHART */}
      {filterType === "weekly" && (
        <div style={{ width: "90%", margin: "40px auto" }}>
          <h3>Weekly Summary</h3>
          <Bar data={getWeeklyData()} />
        </div>
      )}

      {/* MONTHLY CHART */}
      {filterType === "monthly" && (
        <div style={{ width: "90%", margin: "40px auto" }}>
          <h3>Monthly Summary</h3>
          <Line data={getMonthlyData()} />
        </div>
      )}

      {/* CUSTOM RANGE CHART */}
      {filterType === "custom" && customStart && customEnd && (
        <div style={{ width: "90%", margin: "40px auto" }}>
          <h3>Custom Date Range</h3>
          <Line data={getCustomData()} />
        </div>
      )}
    </div>
  );
}

export default Overview;
