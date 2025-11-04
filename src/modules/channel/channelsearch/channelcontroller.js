import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

// Search a specific user in a specific channel
const searchChannelMembers = async (req, res) => {
  try {
    const { channelName, username } = req.params;

    // ✅ Find only active (non-deleted) channel
    const channel = await Createchannel.findOne({
      channel: channelName,
      isDeleted: false,
    }).populate({
      path: "members",
      match: { isDeleted: false }, // ✅ exclude deleted users
      select: "username -_id",
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channelName}' not found or has been deleted.`,
      });
    }

    // ✅ If username provided, check if they exist & active
    if (username) {
      const user = await User.findOne({ username, isDeleted: false });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `${username} not found or has been deleted.`,
        });
      }

      const isMember = channel.members.some(
        (member) => member.username.toLowerCase() === username.toLowerCase()
      );

      if (!isMember) {
        return res.status(404).json({
          success: false,
          message: `${username} is not a member of '${channelName}'.`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `${username} is a member of '${channelName}'.`,
      });
    }

    // ✅ Return all active members
    const members = channel.members.map((m) => m.username);

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Error searching channel members:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default searchChannelMembers;