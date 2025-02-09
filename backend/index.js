import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


import passport from 'passport';
import  './config/passport.js';
import session from 'express-session';
import mongoose from 'mongoose';
import router from './routes/authRoutes.js';



const app = express();

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
  
  app.listen(5000, () => console.log("Server running on port 5000"));