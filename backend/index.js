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
app.use(cors());



app.use(
    session({
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
});

app.use('/auth', router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});