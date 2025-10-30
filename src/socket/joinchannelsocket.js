function handlejoinchannel(ws, users, parsed) {
  if (parsed.event !== "joinChannel") return;

  const channel = parsed.data?.channel?.trim();
  const user = users.get(ws);

  if (!user) {
    ws.send(JSON.stringify({ event: "error", data: "Register first" }));
    return;
  }
  if (!channel) {
    ws.send(JSON.stringify({ event: "error", data: "Channel name required" }));
    return;
  }

  user.channel = channel;
  users.set(ws, user);
  ws.send(JSON.stringify({ event: "joinedChannel", data: { channel } }));
  console.log(`${user.username} joined channel ${channel}`);
}

export default handlejoinchannel;