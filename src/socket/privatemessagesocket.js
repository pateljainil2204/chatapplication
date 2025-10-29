function handleprivatemessage(ws, users, parsed) {
  if (parsed.event !== "sendPrivateMessage") return;

  const fromUser = users.get(ws);
  const toUsername = parsed.data?.to?.trim();
  const message = parsed.data?.message?.trim();

  if (!fromUser) {
    ws.send(JSON.stringify({ event: "error", data: "Register first" }));
    return;
  }

  if (!toUsername || !message) {
    ws.send(JSON.stringify({
      event: "error",
      data: "Missing recipient or message",
    }));
    return;
  }

// checks sender and receiver is registered and message is written 
  let targetFound = false;
  for (const [client, info] of users.entries()) {
    if (info.username === toUsername && client.readyState === ws.OPEN) {
      targetFound = true;
      client.send(
        JSON.stringify({
          event: "privateMessage",
          data: { from: fromUser.username, message },
        })
      );
      ws.send(JSON.stringify({
        event: "ack",
        data: `Private message sent to ${toUsername}`,
      }));
    }
  }

  if (!targetFound) {
    ws.send(JSON.stringify({
      event: "error",
      data: `User ${toUsername} not found or offline`,
    }));
  }
}

export default handleprivatemessage;