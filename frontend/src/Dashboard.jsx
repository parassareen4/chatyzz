import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Get token from URL if redirected from Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token");

    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
      window.history.replaceState({}, document.title, "/dashboard"); // Remove token from URL
    }

    // 2️⃣ Fetch User Data
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await axios.get("https://chatyzz.onrender.com/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.log("Error fetching user:", err);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dashboard</h1>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Chatyzz</h1>
      <Link to="/videocall">
        <button>Start Video Call</button>
      </Link>
    </div>
      {user ? (
        <div>
          <h2>Welcome, {user.name}</h2>
          <img src={user.avatar} alt="Profile" width="100" />
          <br />
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Dashboard;
