import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Overview() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(saved);
  }, []);

  const categories = ["Grocery", "Shopping", "Medicine", "Other"];

  const categoryTotals = categories.map((cat) => {
    return transactions
      .filter((t) => t.category === cat && t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  });

  const data = {
    labels: categories,
    datasets: [
      {
        data: categoryTotals,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#7FFF00"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#7FFF00"],
      },
    ],
  };

  return (
    <div className="overview-page" style={{ padding: "20px" }}>
      <h2>Overview</h2>
      <p>Visual summary of your expenses and incomes.</p>

      {transactions.length === 0 ? (
        <p>No data available yet.</p>
      ) : (
        <div style={{ width: "350px", margin: "auto" }}>
          <Pie data={data} />
        </div>
      )}
    </div>
  );
}

export default Overview;
