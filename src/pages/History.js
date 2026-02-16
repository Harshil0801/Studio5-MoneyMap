import React, { useMemo, useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

// PDF libraries
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getRatesTable } from "../utils/exchangeRateService";

function History({ transactions = [], exchangeRate = 1, selectedCurrency = "NZD" }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "",
    currency: "NZD",
    amountNZD: null,
  });

  const safeNumber = (val) => {
    const n = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
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

  const formatDate = (d) => {
    const dateObj = toDateObj(d);
    return isNaN(dateObj.getTime()) ? "-" : dateObj.toLocaleDateString();
  };

  /**
   * ✅ True multi-currency display:
   * Prefer amountNZD (base) if present; else fallback to amount.
   * Then convert NZD -> selectedCurrency using exchangeRate.
   */
  const toDisplayAmount = (t) => {
    const baseNZD =
      t?.amountNZD != null ? safeNumber(t.amountNZD) : safeNumber(t.amount);
    return baseNZD * (exchangeRate || 1);
  };

  const fmt = (n) => Number(n || 0).toFixed(2);

  const money = (n) => `${fmt(n)} ${selectedCurrency}`;

  // ==========================
  // ✅ Summary Cards
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
      count: transactions.length,
    };
  }, [transactions, exchangeRate]);

  // ==========================
  // ✅ Sort by date (newest first)
  // ==========================
  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const da = toDateObj(a.date).getTime();
      const db_ = toDateObj(b.date).getTime();
      return (db_ || 0) - (da || 0);
    });
  }, [transactions]);

  // ============================
  // DOWNLOAD PDF (WITH CURRENCY)
  // ============================
  const downloadPDF = () => {
    const docPDF = new jsPDF();

    docPDF.setFontSize(18);
    docPDF.text("MoneyMap - Transaction History", 14, 18);

    docPDF.setFontSize(11);
    docPDF.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    docPDF.text(`Currency view: ${selectedCurrency}`, 14, 32);

    const rows = sorted.map((t) => {
      const originalCurrency = t.currency || "NZD";
      const originalAmount = safeNumber(t.amount);
      const displayAmount = toDisplayAmount(t);

      return [
        formatDate(t.date),
        t.description || "",
        t.category || "",
        t.type || "",
        `${t.type === "income" ? "+" : "-"} ${fmt(originalAmount)} ${originalCurrency}`,
        `${t.type === "income" ? "+" : "-"} ${fmt(displayAmount)} ${selectedCurrency}`,
      ];
    });

    autoTable(docPDF, {
      head: [["Date", "Description", "Category", "Type", "Original", `Converted (${selectedCurrency})`]],
      body: rows,
      startY: 38,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 122, 122] },
    });

    docPDF.save("MoneyMap_Transactions.pdf");
  };

  // ============================
  // OPEN EDIT POPUP
  // ============================
  const openEditPopup = (t) => {
    const dObj = toDateObj(t.date);
    const dateForInput = isNaN(dObj.getTime()) ? "" : dObj.toISOString().slice(0, 10);

    setEditData({
      id: t.id,
      date: dateForInput,
      description: t.description || "",
      category: t.category || "",
      amount: safeNumber(t.amount),
      type: t.type || "expense",
      currency: t.currency || "NZD",
      amountNZD: t.amountNZD ?? null,
    });
    setEditing(true);
  };

  // ============================
  // SAVE EDITED TRANSACTION
  // ============================
  const saveEdit = async () => {
    try {
      const ref = doc(db, "transactions", editData.id);

      let newAmountNZD = editData.amountNZD;

      const hasCurrency = !!editData.currency;
      if (hasCurrency) {
        const table = await getRatesTable();
        const rates = table?.rates || { NZD: 1 };

        const amt = safeNumber(editData.amount);
        const cur = editData.currency || "NZD";

        if (cur === "NZD") {
          newAmountNZD = amt;
        } else {
          const rate = rates?.[cur];
          newAmountNZD = rate ? amt * (1 / rate) : amt;
        }

        newAmountNZD = Number(Number(newAmountNZD).toFixed(2));
      }

      await updateDoc(ref, {
        date: editData.date ? new Date(editData.date) : new Date(),
        description: editData.description,
        category: editData.category,
        amount: Number(safeNumber(editData.amount).toFixed(2)),
        type: editData.type,
        ...(hasCurrency ? { currency: editData.currency, amountNZD: newAmountNZD } : {}),
      });

      alert("Transaction updated!");
      setEditing(false);
    } catch (err) {
      alert("Error updating transaction");
      console.log(err);
    }
  };

  // ==========================
  // UI styles (light + modern)
  // ==========================
  const card = {
    background: "white",
    border: "1px solid #dbe3ea",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
  };

  const badge = (type) => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: type === "income" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
    color: type === "income" ? "#166534" : "#991b1b",
    border: `1px solid ${type === "income" ? "rgba(22,163,74,0.35)" : "rgba(220,38,38,0.35)"}`,
    textTransform: "capitalize",
  });

  return (
    <div className="history-page" style={{ padding: 8 }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0, color: "#0f172a" }}>Transaction History</h2>
        <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13 }}>
          View, export, and edit transactions. Showing converted values in <b>{selectedCurrency}</b>.
        </p>
      </div>

      {/* ✅ Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          margin: "14px 0",
        }}
      >
        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Income</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, color: "#16a34a" }}>
            {money(summary.income)}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Expense</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, color: "#dc2626" }}>
            {money(summary.expense)}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Balance</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              marginTop: 6,
              color: summary.balance >= 0 ? "#0ea5e9" : "#b45309",
            }}
          >
            {money(summary.balance)}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>Transactions</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginTop: 6, color: "#0f172a" }}>
            {summary.count}
          </div>
        </div>
      </div>

      {/* Top actions */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ color: "#64748b", fontSize: 12 }}>
          Tip: “Original” shows stored currency. “Converted” uses amountNZD → {selectedCurrency}.
        </div>

        <button
          onClick={downloadPDF}
          style={{
            padding: "10px 14px",
            backgroundColor: "#0078ff",
            color: "white",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          📄 Download PDF
        </button>
      </div>

      {/* ✅ Table Card */}
      <div style={{ ...card, marginTop: 14, padding: 0 }}>
        {sorted.length === 0 ? (
          <p style={{ padding: 16, margin: 0 }}>No transactions found.</p>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: 520 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Date", "Description", "Category", "Type", "Original", `Converted (${selectedCurrency})`, "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          background: "#f8fafc",
                          textAlign: "left",
                          padding: "12px 14px",
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
                {sorted.map((t) => {
                  const originalCurrency = t.currency || "NZD";
                  const originalAmount = safeNumber(t.amount);
                  const displayAmount = toDisplayAmount(t);

                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #eef2f7" }}>
                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>
                        {formatDate(t.date)}
                      </td>

                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>
                        {t.description || "-"}
                      </td>

                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>
                        {t.category || "-"}
                      </td>

                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7" }}>
                        <span style={badge(t.type)}>{t.type}</span>
                      </td>

                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7", fontSize: 13 }}>
                        {t.type === "income" ? "+" : "-"} {fmt(originalAmount)} {originalCurrency}
                      </td>

                      <td
                        style={{
                          padding: "12px 14px",
                          borderBottom: "1px solid #eef2f7",
                          fontSize: 13,
                          fontWeight: 900,
                          color: t.type === "income" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {t.type === "income" ? "+" : "-"} {fmt(displayAmount)} {selectedCurrency}
                      </td>

                      <td style={{ padding: "12px 14px", borderBottom: "1px solid #eef2f7" }}>
                        <button
                          onClick={() => openEditPopup(t)}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#ff9800",
                            color: "white",
                            border: "none",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontWeight: 900,
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Modern Edit Modal */}
      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0px 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#0f172a" }}>Edit Transaction</h3>
              <button
                onClick={() => setEditing(false)}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "white",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>Description</label>
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Description"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #dbe3ea",
                    marginTop: 6,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>Amount</label>
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                  placeholder="Amount"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #dbe3ea",
                    marginTop: 6,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>Currency (stored)</label>
                <input
                  type="text"
                  value={editData.currency}
                  readOnly
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    background: "#f1f5f9",
                    border: "1px solid #dbe3ea",
                    marginTop: 6,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>Type</label>
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #dbe3ea",
                    marginTop: 6,
                    background: "white",
                  }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>Category</label>
                <input
                  type="text"
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  placeholder="Category"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #dbe3ea",
                    marginTop: 6,
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 900, color: "#64748b" }}>Date</label>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #dbe3ea",
                    marginTop: 6,
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                onClick={saveEdit}
                style={{
                  flex: 1,
                  background: "#16a34a",
                  padding: 12,
                  color: "white",
                  fontWeight: 900,
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  background: "#64748b",
                  padding: 12,
                  color: "white",
                  fontWeight: 900,
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .history-page > div[style*="repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default History;
