import React, { useEffect, useState } from "react";
import { fetchWeeklyData } from "../services/reportService";

function WeeklyReport({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchWeeklyData(userId).then(setData);
  }, [userId]);

  const totalIncome = data.filter(d => d.type === "income")
                          .reduce((a, b) => a + b.amount, 0);

  const totalExpense = data.filter(d => d.type === "expense")
                           .reduce((a, b) => a + b.amount, 0);

  return (
    <div className="weekly-report">
      <h1>Weekly Report</h1>

      <p><strong>Total Income:</strong> ${totalIncome}</p>
      <p><strong>Total Expense:</strong> ${totalExpense}</p>
      <p><strong>Savings:</strong> ${totalIncome - totalExpense}</p>

    </div>
  );
}

export default WeeklyReport;
