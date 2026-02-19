import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/UpdateProfile.css";
import { setDoc } from "firebase/firestore"; 
const UpdateProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================
  // FETCH USER DATA
  // ==========================
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setFormData({
          firstName: snap.data().firstName || "",
          lastName: snap.data().lastName || "",
          email: snap.data().email || "",
          contact: snap.data().contact || ""
        });
      }
    };

    fetchUserData();
  }, []);

  // ==========================
  // HANDLE INPUT CHANGE
  // ==========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ==========================
  // HANDLE SUBMIT
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) return;

      

await setDoc(
  doc(db, "users", user.uid),
  {
    firstName: formData.firstName,
    lastName: formData.lastName,
    contact: formData.contact
  },
  { merge: true }
);


      setMessage("✅ Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to update profile.");
    }

    setLoading(false);
  };

  return (
    <div className="update-page">
      <div className="update-card">
        <h2>Update Profile</h2>

        {message && <p>{message}</p>}

        <form onSubmit={handleSubmit}>

          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />

          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />

          <label>Email (Cannot be changed)</label>
          <input
            type="email"
            value={formData.email}
            disabled
          />

          <label>Contact Number</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </button>

          <button type="button" onClick={() => navigate("/dashboard")}>
            Cancel
          </button>

        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
