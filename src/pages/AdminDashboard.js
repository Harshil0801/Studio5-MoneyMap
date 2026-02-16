import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc
} from "firebase/firestore";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    contact: "",
    role: "user"
  });

  //  Load Users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsers(list);
    setFilteredUsers(list);
    setLoading(false);
  };

  // Search Users
  const handleSearch = (value) => {
    setSearch(value);

    const filtered = users.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(value.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(value.toLowerCase()) ||
        u.email?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  // Add User
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.firstName || !newUser.email) {
      alert("First name and email are required");
      return;
    }

    const docRef = await addDoc(collection(db, "users"), newUser);

    const addedUser = { id: docRef.id, ...newUser };

    setUsers([...users, addedUser]);
    setFilteredUsers([...users, addedUser]);

    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      contact: "",
      role: "user"
    });
  };

  // Delete User
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "users", id));

    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    setFilteredUsers(updated);
  };

  if (loading) return <h2>Loading users…</h2>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Management Panel</h2>

      {/*  Search */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />

      {/*  Add User Form */}
      <form onSubmit={handleAddUser} className="add-user-form">
        <input
          type="text"
          placeholder="First Name"
          value={newUser.firstName}
          onChange={(e) =>
            setNewUser({ ...newUser, firstName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newUser.lastName}
          onChange={(e) =>
            setNewUser({ ...newUser, lastName: e.target.value })
          }
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) =>
            setNewUser({ ...newUser, email: e.target.value })
          }
        />
        <input
          type="date"
          value={newUser.dob}
          onChange={(e) =>
            setNewUser({ ...newUser, dob: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Contact"
          value={newUser.contact}
          onChange={(e) =>
            setNewUser({ ...newUser, contact: e.target.value })
          }
        />
        <select
          value={newUser.role}
          onChange={(e) =>
            setNewUser({ ...newUser, role: e.target.value })
          }
        >
          <option value="user">User</option>

          <option value="admin">Admin</option>
        </select>

        <button type="submit">Add User</button>
      </form>

      {/*  Users Table */}
      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>DOB</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.dob}</td>
                <td>{u.contact}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="delete-btn"
                  >
                    Delete
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
