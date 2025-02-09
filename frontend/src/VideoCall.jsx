import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:5000");

function VideoCall() {
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      setStream(mediaStream);
      if (userVideo.current) {
        userVideo.current.srcObject = mediaStream;
      }
      console.log(stream)

      socket.emit("join-room", "chatyzz-room", socket.id);

      socket.on("user-connected", (userId) => {
        const peer = createPeer(userId, socket.id, mediaStream);
        peersRef.current.push({ peerID: userId, peer });
        setPeers((users) => [...users, peer]);
      });

      socket.on("user-disconnected", (userId) => {
        const peerObj = peersRef.current.find((p) => p.peerID === userId);
        if (peerObj) peerObj.peer.destroy();
        peersRef.current = peersRef.current.filter((p) => p.peerID !== userId);
        setPeers((prevPeers) => prevPeers.filter((p) => p !== peerObj.peer));
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function createPeer(userId, callerId, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => {
      socket.emit("sending-signal", { userId, callerId, signal });
    });
    return peer;
  }

  return (
    <div>
      <h1>Chatyzz Video Call</h1>
      <video ref={userVideo} autoPlay playsInline />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </div>
  );
}

function Video( peer ) {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline />;
}

export default VideoCall;
