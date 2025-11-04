import Createchannel from "../createchannel/createchannelmodel.js";

// Search a specific user in a specific channel
const searchChannelMembers = async (req, res) => {
  try {
    const { channelName, username } = req.params;

    //  Find only active  channels
    const channel = await Createchannel.findOne({
      channel: channelName,
      isDeleted: false, 
    }).populate("members", "username");

    //  Channel not found or deleted
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channelName}' not found or has been deleted.`,
      });
    }

    //  If username provided, check if they are a member
    if (username) {
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

    //  Otherwise, return all members
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
