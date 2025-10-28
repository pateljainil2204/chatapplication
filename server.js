import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let messages = [];
const users = new Map(); // { ws: { username, channel } }

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send(JSON.stringify({ event: "chatHistory", data: messages }));

  ws.on("message", (msg) => {
    let parsed;

    // incoming messages
    try {
      parsed = JSON.parse(msg.toString());
    } catch {
      parsed = {
        event: "sendMessage",
        data: { message: msg.toString().trim() },
      };
    }

    console.log("Received:", parsed);

    //  REGISTER USER
    if (parsed.event === "register") {
      const username = parsed.data?.username?.trim();
      if (!username) {
        ws.send(JSON.stringify({ event: "error", data: "Username required" }));
        return;
      }

      users.set(ws, { username, channel: null });
      ws.send(JSON.stringify({ event: "registered", data: { username } }));
      console.log(` Registered user: ${username}`);
      return;
    }

    //  JOIN CHANNEL
    if (parsed.event === "joinChannel") {
      const channel = parsed.data?.channel?.trim();
      const user = users.get(ws);

     // check who join channel
      if (!user) {
        ws.send(JSON.stringify({ event: "error", data: "Register first" }));
        return;
      }
      if (!channel) {
        ws.send(
          JSON.stringify({ event: "error", data: "Channel name required" })
        );
        return;
      }

    // checks user is registered and provide channel name 
      user.channel = channel;
      users.set(ws, user);
      ws.send(JSON.stringify({ event: "joinedChannel", data: { channel } }));
      console.log(`${user.username} joined channel ${channel}`);
      return;
    }

    // SEND CHANNEL MESSAGE
    if (parsed.event === "sendMessage") {
      const user = users.get(ws);      

      // checks sender is registered
      if (!user) {
        ws.send(JSON.stringify({ event: "error", data: "Register first" }));
        return;
      }
      if (!user.channel) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: "Join a channel before sending messages",
          })
        );
        return;
      }

      // checks user is joined channel
      const messageText = parsed.data?.message?.trim();
      if (!messageText) {
        ws.send(
          JSON.stringify({ event: "error", data: "Message cannot be empty" })
        );
        return;
      }

      const messageData = {
        user: user.username,
        message: messageText,
        channel: user.channel,
      };

      messages.push(messageData);

      // build message object and add in chat history 
      wss.clients.forEach((client) => {
        const clientUser = users.get(client);
        if (
          client !== ws &&
          client.readyState === ws.OPEN &&
          clientUser?.channel === user.channel
        ) {
          client.send(
            JSON.stringify({ event: "receiveMessage", data: messageData })
          );
        }
      });
      return;
    }

    //  SEND PRIVATE MESSAGE
    if (parsed.event === "sendPrivateMessage") {
      const fromUser = users.get(ws);
      
      const toUsername = parsed.data?.to?.trim();
      const message = parsed.data?.message?.trim();

      if (!fromUser) {
        ws.send(JSON.stringify({ event: "error", data: "Register first" }));
        return;
      }

      if (!toUsername || !message) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: "Missing recipient or message",
          })
        );
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
              data: {
                from: fromUser.username,
                message,
              },
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

      if (!targetFound) {
        ws.send(
          JSON.stringify({
            event: "error",
            data: `User ${toUsername} not found or offline`,
          })
        );
      }

      return;
    }
  });

  ws.on("close", () => {
    const user = users.get(ws);
    if (user) {
      console.log(`Disconnected: ${user.username}`);
      users.delete(ws);
    }
  });
});

app.get("/", (req, res) => {
  res.send("WebSocket chat server running with private messages & channels!");
});

const PORT = 3000;
server.listen(PORT, () =>
  console.log(`WebSocket server running on port ${PORT}`)
);  