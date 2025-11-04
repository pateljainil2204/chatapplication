import Createchannel from "./createchannelmodel.js";
import User from "../../user/usermodel.js";

// Create a channel
const createchannel = async (req, res) => {
  try {
    const { channel, username } = req.body;
    if (!channel || !username) {
      return res.status(400).json({ message: "Channel name and username are required" });
    }

    const user = await User.findOne({ username, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found or deleted" });

    const existing = await Createchannel.findOne({ channel, isDeleted: false });
    if (existing) return res.status(400).json({ message: "Channel already exists" });

    const newChannel = await Createchannel.create({
      channel,
      createdBy: user._id,
      members: [user._id],
    });

    res.status(201).json({
      success: true,
      message: "Channel created successfully",
      data: { channel: newChannel.channel, createdBy: username },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Soft delete channel
const deleteChannel = async (req, res) => {
  try {
    const { channel, username } = req.body;
    if (!channel || !username) {
      return res.status(400).json({ message: "Channel name and username are required" });
    }

    const user = await User.findOne({ username, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found or deleted" });

    const existingChannel = await Createchannel.findOne({ channel, isDeleted: false });
    if (!existingChannel)
      return res.status(404).json({ message: "Channel not found or already deleted" });

    if (existingChannel.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only the creator can delete this channel" });
    }

    existingChannel.isDeleted = true;
    await existingChannel.save();

    res.status(200).json({ success: true, message: "Channel deleted successfully (soft delete)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { createchannel, deleteChannel };