import PrivateMessage from "../model/privatemessagemodel.js";

async function handleprivatemessage(ws, users, parsed) {
  if (parsed.event !== "sendPrivateMessage") return;

  const fromUser = [...users.values()].find(u => u.socket === ws);
  const toUsername = parsed.data?.to?.trim();
  const message = parsed.data?.message?.trim();

  if (!fromUser) {
    ws.send(JSON.stringify({ event: "error", data: "Register first" }));
    return;
  }

  if (!toUsername || !message) {
    ws.send(JSON.stringify({ event: "error", data: "Missing recipient or message" }));
    return;
  }

  try {
    const newPrivateMsg = new PrivateMessage({
      sender: fromUser.id,
      receiverUsername: toUsername,
      message,
    });
    await newPrivateMsg.save();
  } catch (err) {
    console.error("Private message save error:", err);
  }

  const recipient = users.get(toUsername);
  if (recipient?.socket && recipient.socket.readyState === ws.OPEN) {
    recipient.socket.send(
      JSON.stringify({
        event: "privateMessage",
        data: { from: fromUser.username, message },
      })
    );

    // Acknowledge sender
    ws.send(
      JSON.stringify({
        event: "ack",
        data: `Private message sent to ${toUsername}`,
      })
    );
  } else {
    ws.send(
      JSON.stringify({
        event: "error",
        data: `User ${toUsername} not found or offline`,
      })
    );
  }
}

export default handleprivatemessage;