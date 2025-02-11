import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  // Create a new room with a unique ID
  const createRoom = () => {
    const newRoomId = uuidV4();
    navigate(`/room/${newRoomId}`);
  };

  // Join an existing room
  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a valid Room ID");
      return;
    }
    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token");

    if (tokenFromURL) {
      document.cookie = `token=${tokenFromURL}; path=/; Secure; SameSite=Strict`; // ✅ Use cookies instead of localStorage
      window.history.replaceState({}, document.title, "/dashboard"); // Remove token from URL
    }

    // Fetch User Data
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://chatyzz.onrender.com/auth/me", {
          withCredentials: true, // ✅ Automatically sends cookies
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.get("https://chatyzz.onrender.com/auth/logout", {
        withCredentials: true,
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Chatyzz</h1>

      {user ? (
        <>
          <h2>Welcome, {user.name}</h2>
          {user.avatar && <img src={user.avatar} alt="Profile" width="100" />}
          <br />
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading...</p>
      )}

      {/* Video Call Button */}
      <div style={{ marginTop: "50px" }}>
        <Link to="/videocall">
          <button>Start Video Call</button>
        </Link>
      </div>

      {/* Room Management */}
      <div style={{ marginTop: "50px" }}>
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
    </div>
  );
}

export default Dashboard;
