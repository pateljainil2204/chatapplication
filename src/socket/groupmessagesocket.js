import Message from "../modules/channel/channelchat/channelchatmodel.js";
import User from "../modules/user/usermodel.js";
import Createchannel from "../modules/channel/createchannel/createchannelmodel.js";

async function handlegroupmessage(ws, wss, users, messages, parsed) {
  // Only handle sendMessage events
  if (!parsed || parsed.event !== "sendMessage") return;

  const user = users.get(ws);
  if (!user) {
    ws.send(JSON.stringify({ event: "error", data: "Register first" }));
    return;
  }

  // ✅ Check if user is soft deleted
  const dbUser = await User.findById(user.id);
  if (!dbUser || dbUser.isDeleted) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Your account is deleted or inactive. You cannot send messages.",
      })
    );
    return;
  }

  // ✅ Require channel name in the data
  const channelName = parsed.data?.channel?.trim();
  if (!channelName) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Channel name is required to send a message.",
      })
    );
    return;
  }

  // ✅ Check if channel exists and is not deleted
  const existingChannel = await Createchannel.findOne({
    channel: channelName,
    isDeleted: false,
  });

  if (!existingChannel) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: `Channel '${channelName}' does not exist or has been deleted.`,
      })
    );
    return;
  }

  // ✅ Check if user is a member of the channel
  const isMember = existingChannel.members.some(
    (memberId) => memberId.toString() === user.id.toString()
  );

  if (!isMember) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: `You are not a member of channel '${channelName}'. Please join first.`,
      })
    );
    return;
  }

  // ✅ Validate message
  const messageText = parsed.data?.message?.trim();
  if (!messageText) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Message cannot be empty.",
      })
    );
    return;
  }

  // ✅ Prepare message data with timestamp and channel
  const messageData = {
    user: user.username,
    message: messageText,
    channel: channelName,
    timestamp: new Date().toISOString(),
  };
  messages.push(messageData);

  try {
    // Save to DB
    const newMessage = new Message({
      sender: user.id,
      channel: channelName,
      message: messageText,
    });
    await newMessage.save();
  } catch (err) {
    console.error("DB Save Error:", err);
  }

  // ✅ Broadcast message to all users in same channel
  wss.clients.forEach((client) => {
    const clientUser = users.get(client);
    if (
      client.readyState === ws.OPEN &&
      clientUser?.channel === channelName
    ) {
      client.send(
        JSON.stringify({
          event: "receiveMessage",
          data: messageData,
        })
      );
    }
  });
}

export default handlegroupmessage;