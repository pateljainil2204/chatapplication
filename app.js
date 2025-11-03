import express from "express";
import dotenv from "dotenv";
import http from "http";               
import cors from "cors";
import database from "./src/config/db.js";
import expressconfig from "./server.js";
import {initializesocket} from "./src/socket/sockethandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const main = async () => {
  try {
    await database();
    await expressconfig(app);

    app.use(cors());
    app.get("/", (req, res) => {
      res.send("Server is running with WebSocket support");
    });


    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
       initializesocket(server);
    });
  } catch (error) {
    console.log("Error starting server:", error.message);
  }
};

main();