import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();


// Register User
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ name, email, password: hashedPassword });
  
      await user.save();
      res.json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Login User
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Google OAuth
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  
  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req, res) => {
      console.log("Google Callback Hit"); // Debugging
      console.log("User Data:", req.user); // Log user data
  
      if (!req.user) {
        return res.status(401).json({ message: "Google authentication failed" });
      }
  
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      res.redirect(`https://chatyzz.netlify.app/dashboard?token=${token}`);
    }
  );
  
  
  // Get User Info
  router.get("/me", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      res.json(user);
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  });
  
  // Logout
  router.get("/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
  


export default router;