import { Server } from "socket.io";
import { ENV } from "./env.js";

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ENV.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);

    socket.on("join", (userId) => {
      // join a room named after the user id so we can emit directly later
      if (userId) {
        socket.join(userId.toString());
        socket.data.userId = userId;
        console.log(`socket ${socket.id} joined room ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected", socket.id);
    });
  });

  return io;
}

export function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
