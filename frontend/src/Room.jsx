import React, {useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";
const socket = io("https://chatyzz.onrender.com");

function Room() {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [peerId, setPeerId] = useState("");
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerInstance = useRef(null);

  const addVideoStream = (stream, peerId) => {
    let video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("data-peer-id", peerId);
  
    document.getElementById("video-container").appendChild(video);
  };
  

  useEffect(() => {
    const userName = prompt("Enter your name:");
    const peer = new Peer(); // Initialize PeerJS
    peerInstance.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("join-room", { roomId, userName, peerId: id });
    });

    

    socket.on("user-joined", (users) => {
        users.forEach((user) => {
          if (user.peerId !== peer.id) {
            const call = peer.call(user.peerId, localVideoRef.current.srcObject);
      
            call.on("stream", (remoteStream) => {
              addVideoStream(remoteStream, user.peerId); // Handles multiple streams
            });
          }
        });
      });
    socket.on("user-left", (users) => {
      setUsers(users);
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.on("user-joined", (users) => {
          users.forEach((user) => {
            if (user.peerId !== peer.id) {
              const call = peer.call(user.peerId, stream);
              call.on("stream", (remoteStream) => {
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                }
              });
            }
          });
        });

        peer.on("call", (call) => {
            call.answer(localVideoRef.current.srcObject);
          
            call.on("stream", (remoteStream) => {
              addVideoStream(remoteStream, call.peer);
            });
          });
          
      });

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off();
      peer.disconnect();
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
      <div style={{ display: "flex", gap: "20px" }}>
        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "300px", border: "2px solid green" }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px", border: "2px solid red" }} />
      </div>
      <button onClick={() => navigate("/")}>Leave Room</button>
    </div>
  );
}

export default Room;
