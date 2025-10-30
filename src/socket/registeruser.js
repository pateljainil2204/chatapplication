function handleusersocket(ws, users, parsed) {
  if (parsed.event !== "register") return;

  const username = parsed.data?.username?.trim();
  if (!username) {
    ws.send(JSON.stringify({ event: "error", data: "Username required" }));
    return;
  }

  users.set(ws, { username, channel: null });
  ws.send(JSON.stringify({ event: "registered", data: { username } }));
  console.log(`Registered user: ${username}`);
}

export default handleusersocket;