import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

export default function App() {
  // Home page
  const Home = () => (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ color: "#222" }}>Welcome to Money Map</h1>
      <p style={{ fontSize: "18px", color: "#555" }}>
        Track your budget and expenses easily. Stay in control of your money!
      </p>
    </div>
  );

  // Login page
  const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      alert(`Logged in as ${email}`);
    };

    return (
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#222" }}>Login to Money Map</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            required
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#222",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Login
          </button>
        </form>
      </div>
    );
  };

  // Register page
  const Register = () => (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2 style={{ color: "#222" }}>Register for Money Map</h2>
      <p style={{ color: "#555" }}>Registration page coming soon!</p>
    </div>
  );

  // Dashboard page
  const Dashboard = () => {
    const [expenses, setExpenses] = useState([
      { id: 1, title: "Groceries", amount: 50 },
      { id: 2, title: "Transport", amount: 20 },
    ]);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");

    const addExpense = (e) => {
      e.preventDefault();
      if (!title || !amount) return;
      const newExpense = { id: Date.now(), title, amount: parseFloat(amount) };
      setExpenses([...expenses, newExpense]);
      setTitle("");
      setAmount("");
    };

    return (
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#222" }}>Dashboard</h2>

        {/* Add Expense Form */}
        <form
          onSubmit={addExpense}
          style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}
        >
          <input
            type="text"
            placeholder="Expense title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", flex: 1 }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100px" }}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#222",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </form>

        {/* Expense List */}
        <div>
          {expenses.map((exp) => (
            <div
              key={exp.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 20px",
                marginBottom: "10px",
                backgroundColor: "#f5f5f5",
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <span>{exp.title}</span>
              <span>${exp.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Router>
      {/* Navbar */}
      <nav style={{ padding: "10px", background: "#222", display: "flex", justifyContent: "center", gap: "20px" }}>
        <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
          Home
        </Link>
        <Link to="/login" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
          Login
        </Link>
        <Link to="/register" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
          Register
        </Link>
        <Link to="/dashboard" style={{ color: "#fff", textDecoration: "none", fontWeight: "bold" }}>
          Dashboard
        </Link>
      </nav>

      {/* Routes */}
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
