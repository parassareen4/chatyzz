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
  const localVideoRef = useRef();
  const peerInstance = useRef(null);
  const localStreamRef = useRef(null);
  const connectedPeers = useRef(new Set()); // Prevent duplicate connections

  const addVideoStream = (stream, peerId) => {
    let existingVideo = document.querySelector(`[data-peer-id="${peerId}"]`);
    if (existingVideo) return;

    let video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("data-peer-id", peerId);
    video.style.borderRadius = "10px";
    video.style.margin = "10px";
    video.style.width = "250px";
    video.style.height = "150px";
    video.style.border = "2px solid #7289da";

    document.getElementById("video-container").appendChild(video);
  };

  useEffect(() => {
    const userName = prompt("Enter your name:");
    const peer = new Peer();
    peerInstance.current = peer;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream; // Store stream reference
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
              call.on("stream", (remoteStream) => {
                addVideoStream(remoteStream, user.peerId);
              });
            }
          });
        });

        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            addVideoStream(remoteStream, call.peer);
          });
        });
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    socket.on("user-left", (users) => {
      setUsers(users);
    });

    socket.on("user-disconnected", (peerId) => {
      let videoToRemove = document.querySelector(`[data-peer-id="${peerId}"]`);
      if (videoToRemove) {
        videoToRemove.remove();
      }
      connectedPeers.current.delete(peerId);
    });

    return () => {
      socket.emit("leave-room", { roomId });

      socket.off("user-joined");
      socket.off("user-left");
      socket.off("user-disconnected");

      if (peerInstance.current) {
        peerInstance.current.disconnect();
      }

      // Stop media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

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
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#ffffff" }}>Room: {roomId}</h1>
      <h2 style={{ color: "#ffffff" }}>Participants:</h2>
      <ul
        style={{
          listStyleType: "none",
          backgroundColor: "#23272a",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
          width: "fit-content",
        }}
      >
        {users.map((user) => (
          <li
            key={user.id}
            style={{
              padding: "8px",
              borderBottom: "1px solid #7289da",
              color: "#ffffff",
            }}
          >
            {user.userName}
          </li>
        ))}
      </ul>

      {/* Video Container */}
      <div
        id="video-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
          backgroundColor: "#23272a",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            borderRadius: "10px",
            margin: "10px",
            width: "250px",
            height: "150px",
            border: "2px solid #7289da",
          }}
        ></video>
      </div>

      {/* Leave Room Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          backgroundColor: "#7289da",
          color: "white",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "0.3s ease",
          marginTop: "20px",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}
      >
        Leave Room
      </button>
    </div>
  );
}

export default Room;
