import Createchannel from "../modules/channel/createchannel/createchannelmodel.js";
import User from "../modules/user/usermodel.js";

async function handlejoinchannel(ws, users, parsed) {
  if (parsed.event !== "joinChannel") return;

  const channelName = parsed.data?.channel?.trim();
  const user = users.get(ws);

  if (!user) {
    ws.send(JSON.stringify({ event: "error", data: "Register first" }));
    return;
  }

  const activeUser = await User.findOne({ _id: user._id, isDeleted: false });
  if (!activeUser) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Your account has been deleted or deactivated.",
      })
    );
    return;
  }

  if (!channelName) {
    ws.send(JSON.stringify({ event: "error", data: "Channel name required" }));
    return;
  }

  try {
    const channel = await Createchannel.findOne({
      channel: channelName,
      isDeleted: false,
    });

    if (!channel) {
      ws.send(
        JSON.stringify({
          event: "error",
          data: `Channel '${channelName}' not found or has been deleted.`,
        })
      );
      return;
    }

    const alreadyMember = channel.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    if (alreadyMember && user.channel === channelName) {
      ws.send(
        JSON.stringify({
          event: "info",
          data: `You are already in channel '${channelName}'.`,
        })
      );
      console.log(`${user.username} is already in channel ${channelName}`);
      return;
    }

    if (!alreadyMember) {
      channel.members.push(user._id);
      await channel.save();
      console.log(`${user.username} added to channel '${channelName}' in DB`);
    }

    user.channel = channelName;
    users.set(ws, user);

    ws.send(
      JSON.stringify({
        event: "joinedChannel",
        data: { channel: channelName },
      })
    );

    console.log(`${user.username} joined channel ${channelName}`);
  } catch (err) {
    console.error("Join channel error:", err.message);
    ws.send(
      JSON.stringify({ event: "error", data: "Failed to join channel" })
    );
  }
}

export default handlejoinchannel;