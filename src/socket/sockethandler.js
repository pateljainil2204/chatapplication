import { WebSocketServer } from "ws";
import handleprivatemessage from "./privatemessagesocket.js";
import handlejoinchannel from "./joinchannelsocket.js";
import handlegroupmessage from "./groupmessagesocket.js";
import handleusersocket from "./registeruser.js";
import User from "../model/usermodel.js";

function initializesocket(server) {
  const wss = new WebSocketServer({ server });
  const users = new Map();
  let messages = [];

  wss.on("connection", async (ws, req ) => {
    console.log("Client connected");
    ws.send(JSON.stringify({ event: "chatHistory", data: messages }));

    // user restore using user id 
     const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user) {
          users.set(ws, { id: user._id, username: user.username, channel: null });
          console.log(`Auto-restored user: ${user.username}`);
          ws.send(JSON.stringify({ event: "restoreSuccess", data: { userId, username: user.username } }));
        } else {
          ws.send(JSON.stringify({ event: "error", data: "User not found" }));
        }
      } catch (err) {
        console.error("Restore failed:", err);
      }
    };

    ws.on("message", (msg) => {
      let parsed;
      try {
        parsed = JSON.parse(msg.toString());
      } catch {
        parsed = { event: "sendMessage", data: { message: msg.toString().trim() } };
      }

      console.log("Received:", parsed);

      // pass parsed message to each handler
      handleusersocket(ws, users, parsed);
      handlejoinchannel(ws, users, parsed);
      handlegroupmessage(ws, wss, users, messages, parsed); 
      handleprivatemessage(ws, wss, users, parsed);
    });

    ws.on("close", () => {
      const user = users.get(ws);
      if (user) {
        console.log(`Disconnected: ${user.username}`);
        users.delete(ws);
      }
    });
  });
}

export default initializesocket;