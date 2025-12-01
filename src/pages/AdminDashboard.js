import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log("Fetching users...");
        const snap = await getDocs(collection(db, "users"));

        console.log("Users snapshot:", snap);
        if (snap.empty) console.log("No user docs found!");

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("User list:", list);

        setUsers(list);
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <h2>Loading users…</h2>;
  if (error) return <h2 style={{ color: "red" }}>Error: {error}</h2>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>DOB</th>
              <th>Contact</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.dob}</td>
                <td>{u.contact}</td>
                <td>
                  <button onClick={() => navigate(`/admin/user/${u.id}`)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
