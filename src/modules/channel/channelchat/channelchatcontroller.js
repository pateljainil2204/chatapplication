import Message from "./channelchatmodel.js";
import Createchannel from "../createchannel/createchannelmodel.js";

const getChannelChat = async (req, res) => {
  try {
    const { channelName } = req.params;

    const existingChannel = await Createchannel.findOne({
      channel: channelName,
      isDeleted: false,
    });

    if (!existingChannel) {
      return res.status(404).json({
        success: false,
        message: `Channel '${channelName}' not found or has been deleted.`,
      });
    }

    const messages = await Message.find({ channel: existingChannel._id })
      .select("message sender createdAt")
      .populate("sender", "username -_id")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.map((msg) => ({
        sender: msg.sender?.username || "Unknown User",
        message: msg.message,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default getChannelChat;