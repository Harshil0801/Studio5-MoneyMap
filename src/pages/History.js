import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

// PDF libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(false); // popup open
  const [editData, setEditData] = useState({
    id: "",
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "",
  });

  // ============================
  // 📌 FETCH USER TRANSACTIONS
  // ============================
  useEffect(() => {
    const fetchFromFirestore = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(list);
    };

    fetchFromFirestore();
  }, []);

  // ============================
  // 📌 DOWNLOAD PDF
  // ============================
  const downloadPDF = () => {
    const docPDF = new jsPDF();

    docPDF.setFontSize(18);
    docPDF.text("MoneyMap - Transaction History", 14, 20);

    docPDF.setFontSize(12);
    docPDF.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const rows = transactions.map((t) => [
      t.date,
      t.description,
      t.category,
      `${t.type === "income" ? "+" : "-"}$${t.amount}`,
    ]);

    autoTable(docPDF, {
      head: [["Date", "Description", "Category", "Amount"]],
      body: rows,
      startY: 40,
    });

    docPDF.save("MoneyMap_Transactions.pdf");
  };

  // ============================
  // 📌 OPEN EDIT POPUP
  // ============================
  const openEditPopup = (t) => {
    setEditData({
      id: t.id,
      date: t.date,
      description: t.description,
      category: t.category,
      amount: t.amount,
      type: t.type,
    });
    setEditing(true);
  };

  // ============================
  // 📌 SAVE EDITED TRANSACTION
  // ============================
  const saveEdit = async () => {
    try {
      const ref = doc(db, "transactions", editData.id);

      await updateDoc(ref, {
        date: editData.date,
        description: editData.description,
        category: editData.category,
        amount: editData.amount,
        type: editData.type,
      });

      alert("Transaction updated!");

      // Update table instantly
      setTransactions((prev) =>
        prev.map((t) => (t.id === editData.id ? editData : t))
      );

      setEditing(false);
    } catch (err) {
      alert("Error updating transaction");
      console.log(err);
    }
  };

  return (
    <div className="history-page" style={{ padding: "20px" }}>
      <h2>Expense History</h2>
      <p>View and edit your past expenses and incomes.</p>

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
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Action
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
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => openEditPopup(t)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ============================
          📌 EDIT POPUP UI
          ============================ */}
      {editing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "350px",
              background: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Edit Transaction</h3>

            <input
              type="text"
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              placeholder="Description"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />

            <input
              type="number"
              value={editData.amount}
              onChange={(e) =>
                setEditData({ ...editData, amount: e.target.value })
              }
              placeholder="Amount"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />

            <select
              value={editData.type}
              onChange={(e) =>
                setEditData({ ...editData, type: e.target.value })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              type="text"
              value={editData.category}
              onChange={(e) =>
                setEditData({ ...editData, category: e.target.value })
              }
              placeholder="Category"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />

            <input
              type="date"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
              }}
            />

            <button
              onClick={saveEdit}
              style={{
                width: "100%",
                background: "#4caf50",
                padding: "10px",
                color: "white",
                fontWeight: "600",
                border: "none",
                borderRadius: "6px",
                marginBottom: "10px",
              }}
            >
              Save Changes
            </button>

            <button
              onClick={() => setEditing(false)}
              style={{
                width: "100%",
                background: "gray",
                padding: "10px",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
