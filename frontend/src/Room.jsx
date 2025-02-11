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
  const connectedPeers = useRef(new Set()); // Store connected peers to prevent duplicates

  const addVideoStream = (stream, peerId) => {
    let existingVideo = document.querySelector(`[data-peer-id="${peerId}"]`);
    if (existingVideo) return; // Prevent duplicate video elements

    let video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("data-peer-id", peerId);

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

    socket.on("user-joined", (users) => {
      users.forEach((user) => {
        if (!connectedPeers.current.has(user.peerId) && user.peerId !== peer.id) {
          connectedPeers.current.add(user.peerId); // Track connected peers

          const call = peer.call(user.peerId, localVideoRef.current.srcObject);
          call.on("stream", (remoteStream) => {
            addVideoStream(remoteStream, user.peerId);
          });
        }
      });
    });

    socket.on("user-left", (users) => {
      setUsers(users);
    });

    socket.on("user-disconnected", (peerId) => {
      let videoToRemove = document.querySelector(`[data-peer-id="${peerId}"]`);
      if (videoToRemove) {
        videoToRemove.remove();
      }
      connectedPeers.current.delete(peerId); // Remove disconnected peer
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
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
      <div id="video-container">
        <video ref={localVideoRef} autoPlay playsInline muted></video>
      </div>
      <button onClick={() => navigate("/")}>Leave Room</button>
    </div>
  );
}

export default Room;
