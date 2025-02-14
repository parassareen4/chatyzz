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
  const connectedPeers = useRef(new Set());
  const activeCalls = useRef(new Map());


  const addVideoStream = (stream, peerId) => {
    let existingVideo = document.querySelector(`[data-peer-id="${peerId}"]`);
    if (existingVideo) return;

    let video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("data-peer-id", peerId);
    video.style.cssText = "border-radius:10px; margin:10px; width:250px; height:150px; border:2px solid #7289da";
    document.getElementById("video-container").appendChild(video);
  };

  useEffect(() => {
    const userName = prompt("Enter your name:");
    const peer = new Peer();
    peerInstance.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("join-room", { roomId, userName, peerId: id });
    });
    socket.onAny((event, ...args) => {
      console.log(`Received event: ${event}`, args);
    });
    
    socket.on("user-joined", (users) => {
      users.forEach((user) => {
        if (!connectedPeers.current.has(user.peerId) && user.peerId !== peer.id) {
          connectedPeers.current.add(user.peerId);
          if (localVideoRef.current?.srcObject) {
            const call = peer.call(user.peerId, localVideoRef.current.srcObject);
            if (call) {
              call.on("stream", (remoteStream) => {
                addVideoStream(remoteStream, user.peerId);
                activeCalls.current.set(user.peerId, call);  // Store call reference
              });
            }
          }
        }
      });
    });

    socket.on("user-disconnected", (peerId) => {
      console.log(`User disconnected event received for peerId: ${peerId}`); 
    
      const videoToRemove = document.querySelector(`[data-peer-id="${peerId}"]`);
      if (videoToRemove) {
        console.log(`Removing video for peerId: ${peerId}`);
        videoToRemove.srcObject = null;
        videoToRemove.remove();
      } else {
        console.log(`Video element for ${peerId} not found!`);
      }
    
      // Remove from connected peers
      connectedPeers.current.delete(peerId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.peerId !== peerId));
    });
    
    

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            addVideoStream(remoteStream, call.peer);
          });
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Error accessing camera/microphone");
      });

    return () => {
      socket.emit("leave-room", { roomId });

  // Remove all event listeners
  socket.off("user-joined");
  socket.off("user-disconnected");

  // Copy activeCalls.current to a local variable
  const calls = activeCalls.current;

  // Close all active calls safely
  calls.forEach((call) => call.close());
  calls.clear();

  // Disconnect PeerJS
  if (peerInstance.current) {
    peerInstance.current.destroy();
  }
    };
  }, [roomId]);

  return (
    <div style={{ backgroundColor: "#2c2f33", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Room: {roomId}</h1>
      <h2>Participants:</h2>
      <ul style={{ listStyleType: "none", backgroundColor: "#23272a", borderRadius: "10px", padding: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)", width: "fit-content" }}>
        {users.map((user) => (
          <li key={user.peerId} style={{ padding: "8px", borderBottom: "1px solid #7289da", color: "#ffffff" }}>{user.userName}</li>
        ))}
      </ul>
      <div id="video-container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: "20px", backgroundColor: "#23272a", borderRadius: "10px", padding: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)" }}>
        <video ref={localVideoRef} autoPlay playsInline muted style={{ borderRadius: "10px", margin: "10px", width: "250px", height: "150px", border: "2px solid #7289da" }}></video>
      </div>
      <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Room link copied!"); }} style={{ backgroundColor: "#43b581", color: "white", border: "none", padding: "10px 20px", fontSize: "16px", borderRadius: "5px", cursor: "pointer", transition: "0.3s ease", marginTop: "10px" }} onMouseOver={(e) => (e.target.style.backgroundColor = "#3a9e6e")} onMouseOut={(e) => (e.target.style.backgroundColor = "#43b581")}>
        Copy Room Link
      </button>
      <button onClick={() => navigate("/")} style={{ backgroundColor: "#7289da", color: "white", border: "none", padding: "10px 20px", fontSize: "16px", borderRadius: "5px", cursor: "pointer", transition: "0.3s ease", marginTop: "20px" }} onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6ea3")} onMouseOut={(e) => (e.target.style.backgroundColor = "#7289da")}>Leave Room</button>
    </div>
  );
}

export default Room;
