import Createchannel from "../model/createchannelmodel.js";
import User from "../model/usermodel.js";

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

    // 🔍 Check if channel already exists
    const existing = await Createchannel.findOne({ channel });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Channel already exists",
      });
    }

    // 🔍 Find the user who is creating the channel
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

export default createchannel;