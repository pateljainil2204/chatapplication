import User from "./usermodel.js";
import Createchannel from "../channel/createchannel/createchannelmodel.js";
import { getOnlineUsers } from "../../socket/sockethandler.js";

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    const existing = await User.findOne({ username, isDeleted: false });
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
    const users = await User.find({ isDeleted: false }).select("username -_id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all online users
const onlineUsers = async (req, res) => {
  try {
    const usersList = getOnlineUsers();
    const validUsers = [];

    for (const u of usersList) {
      const exists = await User.findOne({ username: u.username, isDeleted: false });
      if (exists) validUsers.push(u.username);
    }

    res.json({
      count: validUsers.length,
      users: validUsers,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch online users" });
  }
};

// Get online users in a specific (non-deleted) channel
const onlineusersinchannel = async (req, res) => {
  try {
    const { channel } = req.params;
    if (!channel)
      return res.status(400).json({ error: "Channel name is required" });

    const existingChannel = await Createchannel.findOne({
      channel: channel,
      isDeleted: false,
    });

    if (!existingChannel) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channel}' not found or has been deleted.`,
      });
    }

    const usersList = getOnlineUsers();
    const filtered = [];

    for (const u of usersList) {
      const exists = await User.findOne({ username: u.username, isDeleted: false });
      if (exists && u.channel && u.channel.toLowerCase() === channel.toLowerCase()) {
        filtered.push(u.username);
      }
    }

    res.json({
      channel,
      count: filtered.length,
      users: filtered,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch online users for channel" });
  }
};

// Delete user by username (soft delete)
const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    user.isDeleted = true;
    await user.save();

    await Createchannel.updateMany(
      { createdBy: user._id, isDeleted: false },
      { $set: { isDeleted: true } }
    );

    res.status(200).json({
      success: true,
      message: `User '${username}' deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getAllUsers, registerUser, onlineUsers, onlineusersinchannel, deleteUser };