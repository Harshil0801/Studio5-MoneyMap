import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

// PDF libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function History() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchFromFirestore = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(list);
    };

    fetchFromFirestore();
  }, []);

  // ============================
  // 📌 DOWNLOAD PDF FUNCTION
  // ============================
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("MoneyMap - Transaction History", 14, 20);

    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare rows
    const rows = transactions.map((t) => [
      t.date,
      t.description,
      t.category,
      `${t.type === "income" ? "+" : "-"}$${t.amount}`
    ]);

    // AutoTable (correct syntax)
    autoTable(doc, {
      head: [["Date", "Description", "Category", "Amount"]],
      body: rows,
      startY: 40,
    });

    doc.save("MoneyMap_Transactions.pdf");
  };

  return (
    <div className="history-page" style={{ padding: "20px" }}>
      <h2>Expense History</h2>
      <p>View and filter all your past expenses and incomes.</p>

      {/* Download PDF Button */}
      <button
        onClick={downloadPDF}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0078ff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "15px",
          fontWeight: "600",
        }}
      >
        📄 Download PDF
      </button>

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
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
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
            {transactions.map((t) => (
              <tr key={t.id}>
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
