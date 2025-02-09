import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Only for email/password users
  googleId: String, // Only for Google OAuth users
  avatar: String,
});

const User = mongoose.model("User", UserSchema);

export default User;
