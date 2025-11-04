import User from "./usermodel.js";
import Createchannel from "../channel/createchannel/createchannelmodel.js";
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

// Get all online users
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
    const filtered = usersList.filter(
      (u) => u.channel && u.channel.toLowerCase() === channel.toLowerCase()
    );
    const usernames = filtered.map((u) => u.username);

    res.json({
      channel,
      count: usernames.length,
      users: usernames,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch online users for channel" });
  }
};

// 🧹 Hard delete user by username (completely remove from DB)
const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🧩 Delete all channels created by this user
    const deletedChannels = await Createchannel.deleteMany({ createdBy: user._id });

    // 🧩 Permanently remove user
    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: `User '${username}' and all their channels deleted permanently.`,
      deletedChannels: deletedChannels.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getAllUsers, registerUser, onlineUsers, onlineusersinchannel, deleteUser };
