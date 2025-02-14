import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';

import { ExpressPeerServer } from 'peer';

import passport from 'passport';
import './config/passport.js';
import session from 'express-session';
import mongoose from 'mongoose';
import router from './routes/authRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors({ origin: "*" })); // ✅ Fixed cors('*') issue

app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use("/auth", router);

const rooms = {}; // ✅ Store active rooms

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomId, userName, peerId }) => {
        if (!roomId || !userName || !peerId) {
            console.log("Invalid join-room request");
            return;
        }

        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ id: socket.id, userName, peerId });

        socket.join(roomId);
        io.to(roomId).emit("user-joined", rooms[roomId]);

        console.log(`${userName} joined room: ${roomId} with PeerID: ${peerId}`);
    });

    socket.on("leave-room", ({ roomId, peerId }) => {
        console.log(`📢 User with PeerID ${peerId} left room ${roomId}`);
        socket.to(roomId).emit("user-disconnected", peerId);
      });
      

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    
        for (const roomId in rooms) {
            console.log(`Checking room: ${roomId}`, rooms[roomId]);
    
            const userIndex = rooms[roomId].findIndex((user) => user.id === socket.id);
            if (userIndex !== -1) {
                const disconnectedPeerId = rooms[roomId][userIndex].peerId;
                console.log(`Removing user with PeerID: ${disconnectedPeerId}`);
    
                rooms[roomId].splice(userIndex, 1); // Remove user from room
    
                console.log(`Updated room ${roomId}:`, rooms[roomId]);
    
                io.to(roomId).emit("user-disconnected", disconnectedPeerId); // ✅ Notify frontend
    
                if (rooms[roomId].length === 0) {
                    console.log(`Deleting empty room: ${roomId}`);
                    delete rooms[roomId];
                }
                break; // Exit loop once found
            }
        }
    });
    
    
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));