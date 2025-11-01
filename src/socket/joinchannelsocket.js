import Createchannel from "../model/createchannelmodel.js";

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

    if (!channel.members.includes(user._id)) {
      channel.members.push(user._id);
      await channel.save();
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