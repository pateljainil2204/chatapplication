import Message from "./channelchatmodel.js";
import Createchannel from "../createchannel/createchannelmodel.js";
import User from "../../user/usermodel.js";

const getChannelChat = async (req, res) => {
  try {
    const { channelName } = req.params;

    // ✅ Check only active (non-deleted) channel
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

    // ✅ Fetch messages only for this channel
    const messages = await Message.find({ channel: existingChannel._id })
      .select("message sender createdAt")
      .populate({
        path: "sender",
        match: { isDeleted: false }, // ✅ skip deleted users
        select: "username -_id",
      })
      .sort({ createdAt: 1 });

    // ✅ Filter out messages whose sender is deleted
    const filteredMessages = messages.filter((msg) => msg.sender !== null);

    res.status(200).json({
      success: true,
      count: filteredMessages.length,
      messages: filteredMessages.map((msg) => ({
        sender: msg.sender?.username || "Deleted User",
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