import Message from "../modules/channel/channelchat/channelchatmodel.js";
import User from "../modules/user/usermodel.js";
import Createchannel from "../modules/channel/createchannel/createchannelmodel.js";

async function handlegroupmessage(ws, wss, users, messages, parsed) {
  if (parsed.event !== "sendMessage") return;

  const user = users.get(ws);

  if (!user) {
    ws.send(JSON.stringify({ event: "error", data: "Register first" }));
    return;
  }

  const activeUser = await User.findOne({ _id: user.id, isDeleted: false });
  if (!activeUser) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Your account has been deleted or deactivated.",
      })
    );
    return;
  }

  if (!user.channel) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Join a channel before sending messages",
      })
    );
    return;
  }

  const activeChannel = await Createchannel.findOne({
    _id: user.channel,
    isDeleted: false,
  });
  if (!activeChannel) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Channel not found or has been deleted.",
      })
    );
    return;
  }

  const messageText = parsed.data?.message?.trim();
  if (!messageText) {
    ws.send(
      JSON.stringify({ event: "error", data: "Message cannot be empty" })
    );
    return;
  }

  const messageData = {
    user: activeUser.username,
    message: messageText,
    channel: activeChannel.channel,
  };
  messages.push(messageData);

  try {
    const newMessage = new Message({
      sender: activeUser._id,
      channel: activeChannel._id,
      message: messageText,
    });
    await newMessage.save();
  } catch (err) {
    console.error("DB Save Error:", err);
  }

  wss.clients.forEach((client) => {
    const clientUser = users.get(client);
    if (
      client !== ws &&
      client.readyState === ws.OPEN &&
      clientUser?.channel?.toString() === user.channel.toString()
    ) {
      client.send(
        JSON.stringify({ event: "receiveMessage", data: messageData })
      );
    }
  });
}

export default handlegroupmessage;