import { WebSocketServer } from "ws";
import handleprivatemessage from "./privatemessagesocket.js";
import handlejoinchannel from "./joinchannelsocket.js";
import handlegroupmessage from "./groupmessagesocket.js";
import handleusersocket from "./registerusersocket.js";
import User from "../modules/user/usermodel.js";
import Createchannel from "../modules/channel/createchannel/createchannelmodel.js";

const users = new Map();
let messages = [];

function initializesocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    console.log("Client connected");
    ws.send(JSON.stringify({ event: "chatHistory", data: messages }));

    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");

    if (userId) {
      try {
        const user = await User.findById(userId);

        if (!user || user.isDeleted) {
          ws.send(
            JSON.stringify({
              event: "error",
              data: "User not found or has been deleted.",
            })
          );
          return;
        }

        const userChannels = await Createchannel.find({
          members: user._id,
          isDeleted: false,
        });

        let activeChannel = null;
        if (userChannels.length > 0) {
          activeChannel = userChannels[userChannels.length - 1].channel;
          console.log(
            `Restoring ${user.username} in channel '${activeChannel}'`
          );
        }

        users.set(ws, {
          _id: user._id,
          username: user.username,
          channel: activeChannel,
        });

        ws.send(
          JSON.stringify({
            event: "restoreSuccess",
            data: {
              userId,
              username: user.username,
              activeChannel,
              joinedChannels: userChannels.map((ch) => ch.channel),
            },
          })
        );

        console.log(`Auto-restored user: ${user.username}`);
      } catch (err) {
        console.error("Restore failed:", err);
        ws.send(
          JSON.stringify({
            event: "error",
            data: "Failed to restore user session",
          })
        );
      }
    }

    ws.on("message", (msg) => {
      let parsed;
      try {
        parsed = JSON.parse(msg.toString());
      } catch {
        parsed = {
          event: "sendMessage",
          data: { message: msg.toString().trim() },
        };
      }

      console.log("Received:", parsed);

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

function getOnlineUsers() {
  return Array.from(users.values());
}

export { initializesocket, getOnlineUsers };