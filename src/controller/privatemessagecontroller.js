import PrivateMessage from "../model/privatemessagemodel.js";
import User from "../model/usermodel.js";

const getPrivateChat = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const u1 = await User.findOne({ username: user1 });
    const u2 = await User.findOne({ username: user2 });

    if (!u1 || !u2) {
      return res.status(404).json({ success: false, message: "One or both users not found" });
    }

    const messages = await PrivateMessage.find({
      $or: [
        { sender: u1._id, receiverUsername: user2 },
        { sender: u2._id, receiverUsername: user1 },
      ],
    })
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

export default getPrivateChat;