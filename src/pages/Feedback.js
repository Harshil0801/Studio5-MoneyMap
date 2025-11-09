import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/Feedback.css";

function Feedback() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "feedback"), {
        userId: user ? user.uid : "anonymous",
        name: user?.displayName || "Anonymous User",
        email: user?.email || "No email",
        message,
        timestamp: serverTimestamp(),
        status: "pending",
      });

      alert("Thank you for your feedback!");
      setMessage("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <h2>We’d love your feedback 💬</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Share your thoughts, suggestions, or issues..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;
