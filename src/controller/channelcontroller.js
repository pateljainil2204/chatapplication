import Createchannel from "../model/createchannelmodel.js";
import User from "../model/usermodel.js";

// 🔍 Search a specific user in a specific channel
const searchChannelMembers = async (req, res) => {
  try {
    const { channelName, username } = req.params;

    // Find the channel
    const channel = await Createchannel.findOne({ channel: channelName }).populate(
      "members",
      "username"
    );

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channelName}' not found`,
      });
    }

    // If username param provided, search for that user in members
    if (username) {
      const isMember = channel.members.some(
        (member) => member.username.toLowerCase() === username.toLowerCase()
      );

      if (!isMember) {
        return res.status(404).json({
          success: false,
          message: `${username} is not a member of '${channelName}'`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `${username} is a member of '${channelName}'`,
      });
    }

    // If username not provided → return all members
    const members = channel.members.map((m) => m.username);

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default searchChannelMembers;