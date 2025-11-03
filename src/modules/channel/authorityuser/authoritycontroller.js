import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

// Grant authority to a member in a channel
const giveAuthority = async (req, res) => {
  try {
    const { channel } = req.params; 
    const { creatorUsername, targetUsername } = req.body;

    //  Validate input
    if (!channel || !creatorUsername || !targetUsername) {
      return res.status(400).json({
        success: false,
        message: "channel (in params), creatorUsername, and targetUsername are required",
      });
    }

    //  Find the channel (not soft deleted)
    const channelDoc = await Createchannel.findOne({ channel, isDeleted: false });
    if (!channelDoc) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channel}' not found or has been deleted`,
      });
    }

    //  Find creator and target users
    const creator = await User.findOne({ username: creatorUsername });
    const targetUser = await User.findOne({ username: targetUsername });

    if (!creator || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "Creator or target user not found",
      });
    }

    // Check if requester is the channel creator
    if (channelDoc.createdBy.toString() !== creator._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the channel creator can grant authority",
      });
    }

    //  Ensure target user is a member of the channel
    if (!channelDoc.members.some((m) => m.toString() === targetUser._id.toString())) {
      return res.status(400).json({
        success: false,
        message: `${targetUsername} must be a member of '${channel}' before granting authority`,
      });
    }

    //  Add authorized user list if not exists
    if (!channelDoc.authorizedUsers) channelDoc.authorizedUsers = [];

    //  Check if already authorized
    if (channelDoc.authorizedUsers.some((u) => u.toString() === targetUser._id.toString())) {
      return res.status(400).json({
        success: false,
        message: `${targetUsername} is already authorized in '${channel}'`,
      });
    }

    // Grant authority
    channelDoc.authorizedUsers.push(targetUser._id);
    await channelDoc.save();

    res.status(200).json({
      success: true,
      message: `${targetUsername} has been granted authority in '${channel}'`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default giveAuthority;