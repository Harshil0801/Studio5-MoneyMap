import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "../styles/UserDetails.css";

function UserDetails() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // profile
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) {
          setProfile({ id: userSnap.id, ...userSnap.data() });
        }

        // transactions
        const q = query(
          collection(db, "transactions"),
          where("uid", "==", uid)
        );
        const txSnap = await getDocs(q);
        const list = txSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(list);
      } catch (err) {
        console.error("Error loading user details:", err);
        setError(err.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [uid]);

  if (loading) {
    return <div className="user-details-container">Loading...</div>;
  }

  if (error) {
    return (
      <div className="user-details-container">
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-details-container">
        <h2>User not found</h2>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      <h2>User Details</h2>

      <div className="user-profile-box">
        <h3>Profile</h3>
        <p><strong>First name:</strong> {profile.firstName || "-"}</p>
        <p><strong>Last name:</strong> {profile.lastName || "-"}</p>
        <p><strong>Email:</strong> {profile.email || "-"}</p>
        <p><strong>Contact:</strong> {profile.contact || "-"}</p>
        <p><strong>DOB:</strong> {profile.dob || "-"}</p>
      </div>

      <h3>Transaction history</h3>
      {transactions.length === 0 ? (
        <p>No transactions found for this user.</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.type}</td>
                <td>{t.category}</td>
                <td>{t.description}</td>
                <td
                  className={
                    t.type === "income" ? "amount-income" : "amount-expense"
                  }
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

export default UserDetails;
