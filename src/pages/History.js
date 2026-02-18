import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const loadTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(list);
    };

    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const text = `${t.description || ""} ${t.category || ""}`.toLowerCase();
    const okSearch = text.includes(search.toLowerCase());
    const okType =
      typeFilter === "all" ? true : t.type === typeFilter;
    return okSearch && okType;
  });

  return (
    <div className="history-wrap">
      <div className="history-head">
        <div>
          <h2 className="history-title">Expense History</h2>
          <p className="history-subtitle">
            View and filter all your past expenses and incomes.
          </p>
        </div>
      </div>

      <div className="history-toolbar">
        <div className="history-tools-left">
          <input
            className="history-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="history-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="history-table-card">
        <div className="history-table-scroll">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                  <td>{t.category}</td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`amount-pill ${
                        t.type === "income" ? "income" : "expense"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}$
                      {Number(t.amount).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default History;
