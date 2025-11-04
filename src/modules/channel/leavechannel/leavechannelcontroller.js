import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

// Member leaves the channel voluntarily
const leaveChannel = async (req, res) => {
  try {
    const { channel } = req.params; // channel name from URL
    const { username } = req.body;  // member who wants to leave

    //  Validate inputs
    if (!channel || !username) {
      return res.status(400).json({
        success: false,
        message: "channel (in params) and username (in body) are required",
      });
    }

    // Find channel (must not be deleted)
    const channelDoc = await Createchannel.findOne({ channel, isDeleted: false });
    if (!channelDoc) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channel}' not found or has been deleted`,
      });
    }

    //  Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User '${username}' not found`,
      });
    }

    // Check if user is in the channel
    const isMember = channelDoc.members.some(
      (m) => m.toString() === user._id.toString()
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: `${username} is not a member of '${channel}'`,
      });
    }

    //  Prevent the creator from leaving their own channel
    if (channelDoc.createdBy.toString() === user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Channel creator cannot leave the channel",
      });
    }

    // Remove user from members and authorized list (if present)
    channelDoc.members = channelDoc.members.filter(
      (m) => m.toString() !== user._id.toString()
    );
    if (channelDoc.authorizedUsers?.length) {
      channelDoc.authorizedUsers = channelDoc.authorizedUsers.filter(
        (u) => u.toString() !== user._id.toString()
      );
    }

    await channelDoc.save();

    res.status(200).json({
      success: true,
      message: `${username} has left '${channel}' successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default leaveChannel;