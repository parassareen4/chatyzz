import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const newRoomId = uuidV4();
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId) navigate(`/room/${roomId}`);
  };


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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Chatyzz</h1>
      <button onClick={createRoom}>Create Room</button>
      <br /><br />
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
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
