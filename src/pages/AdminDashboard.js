import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc
} from "firebase/firestore";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    contact: "",
    role: "user"
  });

  // Load users
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

  // Single search (name OR email)
  useEffect(() => {
    if (!search) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredUsers(filtered);
  }, [search, users]);

  // Add or Update user
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email) {
      alert("First name and email are required");
      return;
    }

    if (editingUserId) {
      await updateDoc(doc(db, "users", editingUserId), formData);

      const updatedUsers = users.map((u) =>
        u.id === editingUserId ? { id: editingUserId, ...formData } : u
      );

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setEditingUserId(null);
    } else {
      const docRef = await addDoc(collection(db, "users"), formData);
      const newUser = { id: docRef.id, ...formData };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    }

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      dob: "",
      contact: "",
      role: "user"
    });
  };

  // Edit user
  const handleEdit = (user) => {
    setFormData(user);
    setEditingUserId(user.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await deleteDoc(doc(db, "users", id));

    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    setFilteredUsers(updated);
  };

  if (loading) return <h2 style={{ padding: "40px" }}>Loading...</h2>;

  return (
    <div className="admin-container">

      <h2 className="admin-title">Admin Dashboard</h2>

      {/* SEARCH SECTION */}
      <div className="search-card">
        <h3>Search Users</h3>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MAIN SECTION */}
      <div className="main-section">

        {/* LEFT: Add / Edit User */}
        <div className="add-section">
          <h3>{editingUserId ? "Edit User" : "Add User"}</h3>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              type="date"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Contact"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
              }
            />
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit">
              {editingUserId ? "Update User" : "Add User"}
            </button>
          </form>
        </div>

        {/* RIGHT: User List */}
        <div className="table-section">
          <h3>User List</h3>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>DOB</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Actions</th>
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
                      className="edit-btn"
                      onClick={() => handleEdit(u)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
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

export default AdminDashboard;
