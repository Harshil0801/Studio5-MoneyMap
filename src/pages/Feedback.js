import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/Feedback.css";

// State variables
function Feedback() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

// Handles submission of feedback to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      // Add feedback document to Firestore collection
      await addDoc(collection(db, "feedback"), {
        userId: user ? user.uid : "anonymous",
        name: user?.displayName || "Anonymous User",
        email: user?.email || "No email",
        message,
        timestamp: serverTimestamp(),
        status: "pending",
      });

      setSuccess(true);
      setMessage("");
      setTimeout(() => setSuccess(false), 3000); 
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("⚠️ Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        <h2 className="feedback-title">💬 We’d love your feedback!</h2>
        <p className="feedback-subtitle">
          Your feedback helps us improve MoneyMap and make your budgeting experience even better.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            className="feedback-textarea"
            placeholder="Share your thoughts, suggestions, or issues..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>

          <button
            type="submit"
            className="feedback-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>

        {success && (
          <p className="feedback-success">✅ Thank you! Your feedback has been submitted.</p>
        )}
      </div>
    </div>
  );
}

export default Feedback;
