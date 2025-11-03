import Createchannel from "./createchannelmodel.js";
import User from "../../user/usermodel.js";

// Create a new channel using the registered username
const createchannel = async (req, res) => {
  try {
    const { channel, username } = req.body;

    // ✅ Validate required fields
    if (!channel || !username) {
      return res.status(400).json({
        success: false,
        message: "Channel name and username are required",
      });
    }

    const existing = await Createchannel.findOne({ channel, isDeleted: false });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Channel already exists",
      });
    }

    await Createchannel.deleteMany({ channel, isDeleted: true });

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // ✅ Create the new channel with that user as creator and first member
    const newChannel = await Createchannel.create({
      channel,
      createdBy: user._id,
      members: [user._id],
    });

    res.status(201).json({
      success: true,
      message: "Channel created successfully",
      data: {
        channel: newChannel.channel,
        createdBy: username,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete a channel
const deleteChannel = async (req, res) => {
  try {
    const { channel, username } = req.body;

    //  Validate input
    if (!channel || !username) {
      return res.status(400).json({
        success: false,
        message: "Channel name and username are required",
      });
    }

    //  Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    //  Find channel
    const existingChannel = await Createchannel.findOne({ channel });
    if (!existingChannel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    //  Check if user is the creator
    if (existingChannel.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete this channel",
      });
    }

    //  Check if already deleted
    if (existingChannel.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Channel is already deleted",
      });
    }

    //  Soft delete
    existingChannel.isDeleted = true;
    await existingChannel.save();

    res.status(200).json({
      success: true,
      message: "Channel deleted successfully (soft delete)",
      data: {
        channel: existingChannel.channel,
        deletedBy: username,
        deletedAt: existingChannel.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createchannel, deleteChannel };