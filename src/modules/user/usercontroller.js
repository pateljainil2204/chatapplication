import User from "./usermodel.js";
import { getOnlineUsers } from "../../socket/sockethandler.js"; 

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username already exists" });

    const user = await User.create({ username });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username -_id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const onlineUsers = async (req, res) => {
  try {
    const usersList = getOnlineUsers(); 
    const usernames = usersList.map((u) => u.username); 

    res.json({
      count: usernames.length,
      users: usernames,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch online users" });
  }
};

export { getAllUsers, registerUser, onlineUsers };