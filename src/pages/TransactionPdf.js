import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TransactionPdf() {
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);

  const search = useLocation().search;
  const uid = useMemo(() => new URLSearchParams(search).get("uid"), [search]);

  const formatDate = (d) => {
    try {
      if (d?.toDate) return d.toDate().toLocaleDateString(); // Firestore Timestamp
      if (!d) return "";
      return new Date(d).toLocaleDateString();
    } catch {
      return String(d || "");
    }
  };

  // ✅ useCallback keeps ESLint happy without disabling rules
  const loadTransactions = useCallback(async () => {
    setError("");

    if (!uid) {
      setStatus("UID not found in QR link.");
      setTransactions([]);
      return;
    }

    try {
      setStatus("Fetching transactions…");

      // ✅ Collection: /transactions where uid == scanned uid
      const txRef = collection(db, "transactions");
      const qTx = query(txRef, where("uid", "==", uid));
      const snap = await getDocs(qTx);

      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (!list.length) {
        setStatus("No transactions found for this user.");
        setTransactions([]);
        return;
      }

      // ✅ Safe sorting by date (handles Timestamp/string)
      list.sort((a, b) => {
        const da = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime();
        const dbb = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime();
        return (dbb || 0) - (da || 0);
      });

      setTransactions(list);
      setStatus(`Loaded ${list.length} transactions ✅`);
    } catch (e) {
      console.error("Firestore error:", e);
      setStatus("Error loading transactions.");
      setError(`${e?.code || "unknown"}: ${e?.message || String(e)}`);
    }
  }, [uid]);

  const downloadPdf = () => {
    try {
      setError("");

      if (!transactions.length) {
        setStatus("No transactions to export.");
        return;
      }

      setStatus("Generating PDF…");

      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text("MoneyMap - Transaction History", 14, 18);

      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

      const rows = transactions.map((t) => [
        formatDate(t.date),
        t.description || t.title || "-",
        t.category || "-",
        t.type || "-",
        String(t.amount ?? 0),
        t.currency || "NZD",
      ]);

      autoTable(pdf, {
        startY: 34,
        head: [["Date", "Description", "Category", "Type", "Amount", "Currency"]],
        body: rows,
        styles: { fontSize: 9 },
      });

      // ✅ More reliable than pdf.save() on mobile browsers
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);

      // Download
      const a = document.createElement("a");
      a.href = url;
      a.download = "MoneyMap_Transactions.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Open in new tab (helps iOS/Safari)
      window.open(url, "_blank");

      setStatus("PDF opened/downloaded ✅");
      setTimeout(() => URL.revokeObjectURL(url), 8000);
    } catch (e) {
      console.error("PDF error:", e);
      setStatus("Error generating PDF.");
      setError(`${e?.message || String(e)}`);
    }
  };

  // ✅ loads automatically when uid changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2>MoneyMap</h2>
      <p>{status}</p>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={downloadPdf}
          disabled={!transactions.length}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: transactions.length ? "pointer" : "not-allowed",
          }}
        >
          Download PDF
        </button>

        <button
          onClick={loadTransactions}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            marginLeft: 10,
            cursor: "pointer",
            background: "white",
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <pre
          style={{
            marginTop: 16,
            textAlign: "left",
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
            background: "#fff3f3",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      )}

      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>
        On iPhone, tap “Download PDF” (Safari blocks auto-downloads sometimes).
      </p>
    </div>
  );
}
