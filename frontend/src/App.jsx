import React, { useState } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://chatyzz.onrender.com/auth/login", { email, password });
      const token = res.data.token;
      window.location.href = `/dashboard?token=${token}`; // Redirect with token in URL
    } catch (err) {
      alert("Login failed");
    }
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
      <h1 style={{ color: "#ffffff", marginBottom: "20px" }}>Welcome to Chatyzz</h1>
      
      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "#23272a",
          padding: "30px",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            margin: "10px",
            width: "250px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#2c2f33",
            color: "white",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            margin: "10px",
            width: "250px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#2c2f33",
            color: "white",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#7289da",
            color: "white",
            border: "none",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "0.3s ease",
            marginTop: "10px",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}
        >
          Login
        </button>
      </form>

      {/* Google Login */}
      <a href="https://chatyzz.onrender.com/auth/google">
        <button
          style={{
            backgroundColor: "#ffffff",
            color: "#23272a",
            border: "none",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "0.3s ease",
            marginTop: "15px",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#dddddd")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffff")}
        >
          Login with Google
        </button>
      </a>
    </div>
  );
}

export default App;
