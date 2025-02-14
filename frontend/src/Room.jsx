import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";

const socket = io("https://chatyzz.onrender.com");

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [peerId, setPeerId] = useState("");
  const [streams, setStreams] = useState([]);
  const localVideoRef = useRef();
  const peerInstance = useRef(null);
  const connectedPeers = useRef(new Set());

  useEffect(() => {
    const userName = prompt("Enter your name:");
    const peer = new Peer();
    peerInstance.current = peer;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        peer.on("open", (id) => {
          setPeerId(id);
          socket.emit("join-room", { roomId, userName, peerId: id });
        });

        socket.on("user-joined", (users) => {
          users.forEach((user) => {
            if (!connectedPeers.current.has(user.peerId) && user.peerId !== peer.id) {
              connectedPeers.current.add(user.peerId);
              const call = peer.call(user.peerId, stream);
              
              call?.on("stream", (remoteStream) => {
                setStreams((prevStreams) => {
                  if (!prevStreams.some((s) => s.id === remoteStream.id)) {
                    return [...prevStreams, { id: user.peerId, stream: remoteStream }];
                  }
                  return prevStreams;
                });
              });
            }
          });
        });

        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            setStreams((prevStreams) => {
              if (!prevStreams.some((s) => s.id === remoteStream.id)) {
                return [...prevStreams, { id: call.peer, stream: remoteStream }];
              }
              return prevStreams;
            });
          });
        });
      })
      .catch((err) => {
        console.error("Error getting user media:", err);
        alert("Failed to access camera/microphone.");
      });

    socket.on("user-left", (users) => {
      setUsers(users);
    });

    socket.on("user-disconnected", (peerId) => {
      setStreams((prevStreams) => prevStreams.filter((s) => s.id !== peerId));
      connectedPeers.current.delete(peerId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.peerId !== peerId));
    });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off();
      peer.disconnect();
    };
  }, [roomId]);

  return (
    <div style={{
      backgroundColor: "#2c2f33", color: "white", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Arial, sans-serif", padding: "20px"
    }}>
      <h1>Room: {roomId}</h1>
      <h2>Participants:</h2>
      <ul style={{ listStyleType: "none", backgroundColor: "#23272a", borderRadius: "10px",
        padding: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)", width: "fit-content" }}>
        {users.map((user) => (
          <li key={user.id} style={{ padding: "8px", borderBottom: "1px solid #7289da" }}>{user.userName}</li>
        ))}
      </ul>

      {/* Video Container */}
      <div id="video-container" style={{
        display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center",
        marginTop: "20px", backgroundColor: "#23272a", borderRadius: "10px", padding: "10px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)"
      }}>
        <video ref={localVideoRef} autoPlay playsInline muted style={{
          borderRadius: "10px", margin: "10px", width: "250px", height: "150px",
          border: "2px solid #7289da"
        }}></video>
        {streams.map(({ id, stream }) => (
          <video key={id} autoPlay playsInline style={{
            borderRadius: "10px", margin: "10px", width: "250px", height: "150px",
            border: "2px solid #7289da"
          }} ref={(video) => {
            if (video) video.srcObject = stream;
          }}></video>
        ))}
      </div>

      <button onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        alert("Room link copied!");
      }} style={{ backgroundColor: "#43b581", color: "white", border: "none",
        padding: "10px 20px", fontSize: "16px", borderRadius: "5px", cursor: "pointer",
        transition: "0.3s ease", marginTop: "10px" }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#3a9e6e")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#43b581")}>Copy Room Link</button>

      <button onClick={() => navigate("/")} style={{ backgroundColor: "#7289da", color: "white",
        border: "none", padding: "10px 20px", fontSize: "16px", borderRadius: "5px",
        cursor: "pointer", transition: "0.3s ease", marginTop: "20px" }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}>Leave Room</button>
    </div>
  );
}

export default Room;
