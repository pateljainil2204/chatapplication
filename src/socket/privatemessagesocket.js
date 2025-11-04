import PrivateMessage from "../modules/privatemessage/privatemessagemodel.js";
import User from "../modules/user/usermodel.js";

async function handleprivatemessage(ws, wss, users, parsed) {
  if (parsed.event !== "sendPrivateMessage") return;

  const fromUser = users.get(ws);
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

  const activeSender = await User.findOne({ _id: fromUser.id, isDeleted: false });
  if (!activeSender) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: "Your account has been deleted or deactivated.",
      })
    );
    return;
  }

  const activeReceiver = await User.findOne({ username: toUsername, isDeleted: false });
  if (!activeReceiver) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: `User '${toUsername}' not found or has been deleted.`,
      })
    );
    return;
  }

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
      ws.send(
        JSON.stringify({
          event: "ack",
          data: `Private message sent to ${toUsername}`,
        })
      );
    }
  }

  try {
    const newPrivateMessage = new PrivateMessage({
      sender: activeSender._id,
      receiver: activeReceiver._id,
      receiverUsername: toUsername,
      message,
    });
    await newPrivateMessage.save();
  } catch (err) {
    console.error("DB Save Error:", err);
  }

  if (!targetFound) {
    ws.send(
      JSON.stringify({
        event: "error",
        data: `User ${toUsername} not found or offline`,
      })
    );
  }
}

export default handleprivatemessage;