import Message from "./channelchatmodel.js";

const getChannelChat = async (req, res) => {
  try {
    const { channelName } = req.params;

    const messages = await Message.find({ channel: channelName })
      .select("message sender channel createdAt") 
      .populate("sender", "username -_id") 
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      sender: msg.sender.username,
      channel: msg.channel,
      message: msg.message,
    }));

    res.status(200).json({
      success: true,
      count: formattedMessages.length,
      messages: formattedMessages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default getChannelChat;