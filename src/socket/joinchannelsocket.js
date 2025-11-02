import Createchannel from "../modules/channel/createchannel/createchannelmodel.js";

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
    const channel = await Createchannel.findOne({ channel: channelName });

    if (!channel) {
      ws.send(
        JSON.stringify({
          event: "error",
          data: `Channel '${channelName}' does not exist. Please create it first.`,
        })
      );
      return;
    }

    //  Check if already joined in DB
    const alreadyMember = channel.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    //  If already a member and active, just restore
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

    //  Add only if not already in DB
    if (!alreadyMember) {
      channel.members.push(user._id);
      await channel.save();
      console.log(`${user.username} added to channel '${channelName}' in DB`);
    }

    //  Update local socket session
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