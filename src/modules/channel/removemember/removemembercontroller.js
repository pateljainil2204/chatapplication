import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

const removeMember = async (req, res) => {
  try {
    const { channel, username, memberToRemove } = req.body;

    const user = await User.findOne({ username, isDeleted: false });
    const member = await User.findOne({ username: memberToRemove, isDeleted: false });
    const existingChannel = await Createchannel.findOne({ channel, isDeleted: false });

    if (!user || !member || !existingChannel)
      return res.status(404).json({ message: "User or channel not found/deleted" });

    if (
      existingChannel.createdBy.toString() !== user._id.toString() &&
      !existingChannel.authorizedUsers.includes(user._id)
    ) {
      return res.status(403).json({ message: "Not authorized to remove members" });
    }

    existingChannel.members.pull(member._id);
    await existingChannel.save();

    res.status(200).json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default removeMember;