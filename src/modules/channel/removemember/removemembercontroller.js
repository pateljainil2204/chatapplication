import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

// Remove a member from a channel
const removeMember = async (req, res) => {
  try {
    const { channel } = req.params; // 👈 from URL (/removemember/general)
    const { requesterUsername, memberUsername } = req.body;

    // ✅ Validate input
    if (!channel || !requesterUsername || !memberUsername) {
      return res.status(400).json({
        success: false,
        message: "channel (in params), requesterUsername, and memberUsername are required",
      });
    }

    // ✅ Find the channel (not soft deleted)
    const channelDoc = await Createchannel.findOne({ channel, isDeleted: false });
    if (!channelDoc) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channel}' not found or has been deleted`,
      });
    }

    // ✅ Find requester and member users
    const requester = await User.findOne({ username: requesterUsername });
    const memberToRemove = await User.findOne({ username: memberUsername });

    if (!requester || !memberToRemove) {
      return res.status(404).json({
        success: false,
        message: "Requester or member user not found",
      });
    }

    // ✅ Check if requester is creator or authorized
    const isAuthorized =
      channelDoc.createdBy.toString() === requester._id.toString() ||
      channelDoc.authorizedUsers?.some(
        (u) => u.toString() === requester._id.toString()
      );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or an authorized user can remove members",
      });
    }

    // ✅ Check if member exists in channel
    if (!channelDoc.members.some((m) => m.toString() === memberToRemove._id.toString())) {
      return res.status(404).json({
        success: false,
        message: `${memberUsername} is not a member of '${channel}'`,
      });
    }

    // ✅ Remove the member
    channelDoc.members = channelDoc.members.filter(
      (m) => m.toString() !== memberToRemove._id.toString()
    );

    await channelDoc.save();

    res.status(200).json({
      success: true,
      message: `${memberUsername} has been removed from '${channel}'`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default removeMember;