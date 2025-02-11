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
import MongoStore from 'connect-mongo';

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: "https://chatyzz.netlify.app", // ✅ Set frontend URL
    methods: ["GET", "POST"],
    credentials: true,
};
app.use(cors(corsOptions));

const io = new Server(server, { cors: corsOptions });

app.use(express.json());

app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // ✅ Store sessions in MongoDB
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

app.use("/auth", router);

// ✅ Initialize PeerJS Server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use("/peerjs", peerServer);

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

    socket.on("leave-room", ({ roomId }) => {
        if (!roomId || !rooms[roomId]) return;

        rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id);
        socket.leave(roomId);
        io.to(roomId).emit("user-left", rooms[roomId]);

        if (rooms[roomId].length === 0) delete rooms[roomId];

        console.log(`User left room: ${roomId}`);
    });

    socket.on("disconnect", () => {
        Object.keys(rooms).forEach(roomId => {
            rooms[roomId] = rooms[roomId].filter(user => user.id !== socket.id);
            if (rooms[roomId].length === 0) delete rooms[roomId];
        });
        console.log("User disconnected:", socket.id);
    });
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
