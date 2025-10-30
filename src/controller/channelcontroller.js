import Message from "../model/channelmodel.js";

//  Get all messages from a specific channel
const getChannelChat = async (req, res) => {
  try {
    const { channelName } = req.params;

    const messages = await Message.find({ channel: channelName })
      .populate("sender", "username")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default getChannelChat; 