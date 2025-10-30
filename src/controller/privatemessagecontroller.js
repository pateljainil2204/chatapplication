import PrivateMessage from "../model/privatemessagemodel.js";

const getprivatechat = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;

    const messages = await PrivateMessage.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .populate("sender", "name ")
      .populate("receiver", "name ")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default getprivatechat;