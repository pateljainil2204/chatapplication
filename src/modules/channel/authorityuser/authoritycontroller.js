import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

const giveAuthority = async (req, res) => {
  try {
    const { username, channel, authorizedUser } = req.body;
    if (!username || !channel || !authorizedUser)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ username, isDeleted: false });
    const authUser = await User.findOne({ username: authorizedUser, isDeleted: false });
    const existingChannel = await Createchannel.findOne({ channel, isDeleted: false });

    if (!user || !authUser || !existingChannel)
      return res.status(404).json({ message: "User or channel not found/deleted" });

    if (existingChannel.createdBy.toString() !== user._id.toString())
      return res.status(403).json({ message: "Only creator can give authority" });

    if (!existingChannel.authorizedUsers.includes(authUser._id))
      existingChannel.authorizedUsers.push(authUser._id);

    await existingChannel.save();
    res.status(200).json({ success: true, message: "Authority granted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default giveAuthority;