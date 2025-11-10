import React, { useState, useEffect } from "react";

function History() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Example: fetching from localStorage or Firebase later
    const saved = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(saved);
  }, []);

  return (
    <div className="history-page" style={{ padding: "20px" }}>
      <h2>Expense History</h2>
      <p>View and filter all your past expenses and incomes.</p>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Date
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Description
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Category
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) => (
              <tr key={index}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {t.date}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {t.description}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {t.category}
                </td>
                <td
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    color: t.type === "income" ? "green" : "red",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}${t.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;
