import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

const leaveChannel = async (req, res) => {
  try {
    const { username, channel } = req.body;

    const user = await User.findOne({ username, isDeleted: false });
    const existingChannel = await Createchannel.findOne({ channel, isDeleted: false });

    if (!user || !existingChannel)
      return res.status(404).json({ message: "User or channel not found/deleted" });

    existingChannel.members.pull(user._id);
    await existingChannel.save();

    res.status(200).json({ success: true, message: "Left channel successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default leaveChannel;