function handlegroupmessage(ws, wss, users, messages, parsed) {
  if (parsed.event !== "sendMessage") return;

  const user = users.get(ws);
  if (!user) {
    ws.send(JSON.stringify({ event: "error", data: "Register first" }));
    return;
  }

  if (!user.channel) {
    ws.send(JSON.stringify({ event: "error", data: "Join a channel before sending messages" }));
    return;
  }

  const messageText = parsed.data?.message?.trim();
  if (!messageText) {
    ws.send(JSON.stringify({ event: "error", data: "Message cannot be empty" }));
    return;
  }

  const messageData = { user: user.username, message: messageText, channel: user.channel };
  messages.push(messageData);

  wss.clients.forEach((client) => {
    const clientUser = users.get(client);
    if (
      client !== ws &&
      client.readyState === ws.OPEN &&
      clientUser?.channel === user.channel
    ) {
      client.send(JSON.stringify({ event: "receiveMessage", data: messageData }));
    }
  });
}

export default handlegroupmessage;