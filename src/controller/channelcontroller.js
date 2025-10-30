import Channel from "../model/channelmodel.js";
import Message from "../model/messagemodel.js";

const getgroupmessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await Message.find({ channel: channelId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getgroupmembers = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate("members", "name email");
    if (!channel) return res.status(404).json({ success: false, message: "Channel not found" });
    res.status(200).json({ success: true, members: channel.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getgroupmembers, getgroupmessages };