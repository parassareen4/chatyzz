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
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromURL = urlParams.get("token");

    if (tokenFromURL) {
      localStorage.setItem("token", tokenFromURL);
      window.history.replaceState({}, document.title, "/dashboard");
    }

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
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      <div style={styles.card}>
        <h1 style={styles.header}>Welcome to Chatyzz</h1>
        <Link to="/videocall">
          <button style={styles.button}>Start Video Call</button>
        </Link>
      </div>

      <div style={styles.card}>
        <h1 style={styles.header}>Create or Join a Room</h1>
        <button style={styles.button} onClick={createRoom}>Create Room</button>
        <br /><br />
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={styles.input}
        />
        <button style={styles.button} onClick={joinRoom}>Join Room</button>
      </div>

      {user ? (
        <div style={styles.userProfile}>
          <h2 style={styles.username}>Welcome, {user.name}</h2>
          <img src={user.avatar} alt="Profile" style={styles.avatar} />
          <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p style={styles.loadingText}>Loading...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#2C2F33", // Discord dark theme
    color: "#FFFFFF",
    textAlign: "center",
    minHeight: "100vh",
    padding: "50px 20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#23272A",
    padding: "20px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "400px",
    margin: "20px auto",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
  },
  header: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#7289DA", // Discord blue
    color: "#FFFFFF",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "5px",
    transition: "0.3s",
  },
  buttonHover: {
    backgroundColor: "#5B6EAE",
  },
  input: {
    width: "80%",
    padding: "10px",
    fontSize: "16px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "none",
    textAlign: "center",
  },
  userProfile: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#23272A",
    borderRadius: "8px",
    display: "inline-block",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
  },
  username: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    marginBottom: "10px",
  },
  logoutButton: {
    backgroundColor: "#D32F2F", // Red for logout
    color: "#FFFFFF",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "0.3s",
  },
  loadingText: {
    fontSize: "18px",
    marginTop: "20px",
  },
};

export default Dashboard;
