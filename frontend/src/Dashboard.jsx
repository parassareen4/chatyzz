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
    <div
    style={{
      backgroundColor: "#2c2f33",
      color: "white",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <h1 style={{ color: "#ffffff" }}>Welcome to Chatyzz</h1>

    {user ? (
      <div
        style={{
          backgroundColor: "#23272a",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#ffffff" }}>Welcome, {user.name}</h2>
        {user.avatar && (
          <img
            src={user.avatar}
            alt="Profile"
            style={{
              borderRadius: "50%",
              border: "3px solid #7289da",
              width: "80px",
              height: "80px",
              marginBottom: "10px",
            }}
          />
        )}
        <br />
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#7289da",
            color: "white",
            border: "none",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "0.3s ease",
            marginTop: "10px",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}
        >
          Logout
        </button>
      </div>
    ) : (
      <p>Loading...</p>
    )}

    {/* Video Call Button */}
    <div
      style={{
        backgroundColor: "#23272a",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
        marginBottom: "20px",
      }}
    >
      <Link to="/videocall">
        <button
          style={{
            backgroundColor: "#7289da",
            color: "white",
            border: "none",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}
        >
          Start Video Call
        </button>
      </Link>
    </div>

    {/* Room Management */}
    <div
      style={{
        backgroundColor: "#23272a",
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <button
        onClick={createRoom}
        style={{
          backgroundColor: "#7289da",
          color: "white",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "0.3s ease",
          marginBottom: "10px",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}
      >
        Create Room
      </button>
      <br />
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={{
          backgroundColor: "#23272a",
          border: "2px solid #7289da",
          padding: "10px",
          color: "white",
          fontSize: "16px",
          borderRadius: "5px",
          width: "250px",
          margin: "10px 0",
          outline: "none",
        }}
      />
      <br />
      <button
        onClick={joinRoom}
        style={{
          backgroundColor: "#7289da",
          color: "white",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}
      >
        Join Room
      </button>
    </div>
  </div>

  );
}

export default Dashboard;