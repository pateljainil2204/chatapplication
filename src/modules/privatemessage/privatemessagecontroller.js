import PrivateMessage from "./privatemessagemodel.js";
import User from "../user/usermodel.js";

const sendPrivateMessage = async (req, res) => {
  try {
    const { senderUsername, receiverUsername, text } = req.body;

    const sender = await User.findOne({ username: senderUsername, isDeleted: false });
    const receiver = await User.findOne({ username: receiverUsername, isDeleted: false });

    if (!sender || !receiver)
      return res.status(404).json({ message: "Sender or receiver not found/deleted" });

    const message = await PrivateMessage.create({ sender: sender._id, receiver: receiver._id, text });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default sendPrivateMessage;