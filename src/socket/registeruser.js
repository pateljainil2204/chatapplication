import User from "../model/usermodel.js";

async function handleusersocket(ws, users, parsed) {
  if (parsed.event !== "register") return;

  const username = parsed.data?.username?.trim();
  if (!username) {
    ws.send(JSON.stringify({ event: "error", data: "Username required" }));
    return;
  }

  try {
    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({ username });
    }

    users.set(ws, { id: user._id, username: user.username, channel: null });
    ws.send(JSON.stringify({ event: "registered", data: { username } }));
    console.log(`Registered user: ${username}`);
  } catch (err) {
    console.error("User registration error:", err);
    ws.send(JSON.stringify({ event: "error", data: "Registration failed" }));
  }
}

export default handleusersocket;