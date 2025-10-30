import { WebSocketServer } from "ws";
import handleprivatemessage from "./privatemessagesocket.js";
import handlejoinchannel from "./joinchannelsocket.js";
import handlegroupmessage from "./groupmessagesocket.js";
import handleusersocket from "./registeruser.js";

function initializesocket(server) {
  const wss = new WebSocketServer({ server });
  const users = new Map();
  let messages = [];

  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.send(JSON.stringify({ event: "chatHistory", data: messages }));

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