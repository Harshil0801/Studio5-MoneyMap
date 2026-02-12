import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import "../styles/UpdateProfile.css";

function UpdateProfile() {
  const [formData, setFormData] = useState({
    email: "",
    contact: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          email: data.email || "",
          contact: data.contact || "",
          address: data.address || "",
        });
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //  Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, "users", user.uid);

      // Update Firestore
      await updateDoc(docRef, {
        email: formData.email,
        contact: formData.contact,
        address: formData.address,
      });

      
      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-profile-container">
      <h2>Update Profile</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default UpdateProfile;
