function handleusersocket(ws, users) {
  ws.on("message", (msg) => {
    let parsed;
    try {
      parsed = JSON.parse(msg.toString());
    } catch {
      return;
    }

    //  REGISTER USER
    if (parsed.event === "register") {
      const username = parsed.data?.username?.trim();
      if (!username) {
        ws.send(JSON.stringify({ event: "error", data: "Username required" }));
        return;
      }

      users.set(ws, { username, channel: null });
      ws.send(JSON.stringify({ event: "registered", data: { username } }));
      console.log(`Registered user: ${username}`);
      return;
    }
  });

  //  DISCONNECT EVENT
  ws.on("close", () => {
    const user = users.get(ws);
    if (user) {
      console.log(` Disconnected: ${user.username}`);
      users.delete(ws);
    }
  });
}

export default handleusersocket;