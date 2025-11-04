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

  if (!channelName) {
    ws.send(JSON.stringify({ event: "error", data: "Channel name required" }));
    return;
  }

  try {
    // ✅ Verify user is not deleted
    const dbUser = await User.findById(user.id);
    if (!dbUser || dbUser.isDeleted) {
      ws.send(
        JSON.stringify({
          event: "error",
          data: "User is deleted or inactive. Please contact admin.",
        })
      );
      return;
    }

    // ✅ Find only non-deleted channel
    const channel = await Createchannel.findOne({ channel: channelName, isDeleted: false });

    if (!channel) {
      ws.send(
        JSON.stringify({
          event: "error",
          data: `Channel '${channelName}' does not exist or has been deleted. Please create it first.`,
        })
      );
      return;
    }

    // Already a member
    const alreadyMember = channel.members.some(
      (memberId) => memberId.toString() === user.id.toString()
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
      channel.members.push(user.id);
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
    ws.send(JSON.stringify({ event: "error", data: "Failed to join channel" }));
  }
}

export default handlejoinchannel;