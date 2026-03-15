import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../styles/Home.css";

function Home() {
  const [user, setUser] = useState(null);

  // Admin stats
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalFeedback: 0,
  });

  // admin data view
  const [view, setView] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // User financial stats
  const [finance, setFinance] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) return;

      if (currentUser.email === "moneymapadmin@gmail.com") {
        await loadAdminStats();
      } else {
        await loadUserFinance(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load admin stats
  const loadAdminStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const feedbackSnap = await getDocs(collection(db, "feedback"));

      setAdminStats({
        totalUsers: usersSnap.size,
        totalFeedback: feedbackSnap.size,
      });
    } catch (err) {
      console.log("Admin stats error:", err);
    }
  };

  // Load all users
  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const list = snap.docs.map((doc) => doc.data());
    setUsers(list);
    setView("users");
  };

  // Load feedback
  const loadFeedback = async () => {
    const snap = await getDocs(collection(db, "feedback"));
    const list = snap.docs.map((doc) => doc.data());
    setFeedback(list);
    setView("feedback");
  };

  // Load user income + expense
  const loadUserFinance = async (uid) => {
    try {
      const q = query(collection(db, "transactions"), where("uid", "==", uid));
      const snap = await getDocs(q);

      let income = 0;
      let expense = 0;

      snap.forEach((doc) => {
        const data = doc.data();
        if (!data.amount) return;

        const amt = Number(data.amount);

        if (data.type === "income") income += amt;
        if (data.type === "expense") expense += amt;
      });

      setFinance({
        income,
        expense,
        balance: income - expense,
      });
    } catch (err) {
      console.log("Finance load error:", err);
    }
  };

  return (
    <div className="home">

      {/* ===================== ADMIN OVERVIEW ===================== */}
      {user?.email === "moneymapadmin@gmail.com" && (
        <section className="dashboard-intro" data-aos="fade-up">
          <h1>Welcome back, <span>Admin 👑</span></h1>
          <p>Here’s your system overview:</p>

          <div className="admin-overview">

            <div className="admin-card" onClick={loadUsers}>
              <h3>Total Users</h3>
              <p>{adminStats.totalUsers}</p>
            </div>

            <div className="admin-card" onClick={loadFeedback}>
              <h3>Total Feedback</h3>
              <p>{adminStats.totalFeedback}</p>
            </div>

          </div>

          {/* USERS TABLE */}
          {view === "users" && (
            <div className="admin-results">
              <h2>Registered Users</h2>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u, index) => (
                    <tr key={index}>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.contact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FEEDBACK TABLE */}
          {view === "feedback" && (
            <div className="admin-results">
              <h2>User Feedback</h2>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Message</th>
                  </tr>
                </thead>

                <tbody>
                  {feedback.map((f, index) => (
                    <tr key={index}>
                      <td>{f.name || "Anonymous User"}</td>
                      <td>{f.email || "No email"}</td>
                      <td>{f.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </section>
      )}

      {/* ===================== NORMAL USER HOME ===================== */}
      {user && user.email !== "moneymapadmin@gmail.com" && (
        <section className="user-dashboard" data-aos="fade-up">
          <h1>Welcome back 👋</h1>

          <div className="summary-cards user-cards">
            <div className="summary-card income-card">
              <h3>Total Income</h3>
              <p>${finance.income}</p>
            </div>

            <div className="summary-card expense-card">
              <h3>Total Expense</h3>
              <p>${finance.expense}</p>
            </div>

            <div className="summary-card balance-card">
              <h3>Remaining Balance</h3>
              <p>${finance.balance}</p>
            </div>
          </div>
        </section>
      )}

      {/* ===================== GUEST VIEW ===================== */}
      {!user && (
        <>
          <section className="hero">
            <div className="hero-content" data-aos="fade-up">
              <h1>
                Simplify Your <span>Finances</span> with{" "}
                <span className="brand">MoneyMap 💸</span>
              </h1>
              <p>Track income & expenses, set goals, manage money easily.</p>

              <div className="hero-buttons">
                <Link to="/register" className="btn primary">Get Started</Link>
                <Link to="/login" className="btn secondary">Login</Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ===================== CTA ===================== */}
      <section className="cta" data-aos="zoom-in">
        <h2>
          {user ? "Plan your financial future smarter" : "Start your journey today"}
        </h2>

        <Link
  to={
    !user
      ? "/register"
      : user.email === "moneymapadmin@gmail.com"
      ? "/AdminDashboard"
      : "/dashboard"
  }
  className="btn primary cta-btn"
>
  {user ? "Open Dashboard" : "Join MoneyMap Now"}
</Link>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="footer">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/feedback">Feedback</Link>
        </div>
        <p>© {new Date().getFullYear()} MoneyMap — Smart Budgeting Made Simple</p>
      </footer>
    </div>
  );
}

export default Home;