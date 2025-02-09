import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';

import passport from 'passport';
import  './config/passport.js';
import session from 'express-session';
import mongoose from 'mongoose';
import router from './routes/authRoutes.js';



const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors('*'));



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

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("user-connected", userId);
  
      socket.on("disconnect", () => {
        socket.broadcast.to(roomId).emit("user-disconnected", userId);
      });
    });
  
    socket.on("offer", (data) => {
      socket.broadcast.to(data.room).emit("offer", data);
    });
  
    socket.on("answer", (data) => {
      socket.broadcast.to(data.room).emit("answer", data);
    });
  
    socket.on("ice-candidate", (data) => {
      socket.broadcast.to(data.room).emit("ice-candidate", data);
    });
  });

  
  server.listen(5000, () => console.log("Server running on port 5000"));