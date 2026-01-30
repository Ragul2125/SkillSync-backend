import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import connectDb from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import mainRouter from "./Routes.js";

dotenv.config();
connectDb();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", mainRouter);
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_room", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("send_message", (data) => {
    io.to(data.conversationId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

export { app, server };
