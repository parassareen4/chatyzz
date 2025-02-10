import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("https://chatyzz.onrender.com");

function Room() {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userName = prompt("Enter your name:");

    socket.emit("join-room", { roomId, userName });

    socket.on("user-joined", (users) => {
      setUsers(users);
    });

    socket.on("user-left", (users) => {
      setUsers(users);
    });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off();
    };
  }, [roomId]);

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <h2>Participants:</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.userName}</li>
        ))}
      </ul>
      <button onClick={() => navigate("/")}>Leave Room</button>
    </div>
  );
}

export default Room;
