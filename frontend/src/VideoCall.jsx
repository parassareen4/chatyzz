import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://chatyzz.onrender.com");

const VideoCall = () => {
    const [peerId, setPeerId] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const roomId = "chatyzz-room"; // Hardcoded for testing
  
    useEffect(() => {
      socket.emit("join-room", roomId, socket.id);
      setPeerId(socket.id);
  
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideoRef.current.srcObject = stream;
          peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });
  
          stream.getTracks().forEach((track) =>
            peerConnection.current.addTrack(track, stream)
          );
  
          peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", { candidate: event.candidate, room: roomId });
            }
          };
  
          peerConnection.current.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
          };
        });
  
      socket.on("user-connected", async (userId) => {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("offer", { offer, room: roomId });
      });
  
      socket.on("offer", async ({ offer }) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { answer, room: roomId });
      });
  
      socket.on("answer", async ({ answer }) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      });
  
      socket.on("ice-candidate", ({ candidate }) => {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      });
  
      return () => socket.disconnect();
    }, []);
  
    return (
      <div style={{ textAlign: "center" }}>
        <h2>Chatyzz Video Call</h2>
        <div>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "300px" }} />
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
        </div>
      </div>
    );
  };
  
  export default VideoCall;