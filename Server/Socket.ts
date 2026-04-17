import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server | undefined;

const onlineUsers = new Map<string, string>();

interface JoinPayload {
  userId: string | number;
}

export const initSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    let currentUserId: string | null = null;

    socket.on("user:join", ({ userId }: JoinPayload) => {
      if (!userId) return;
      currentUserId = userId.toString();

      socket.join(currentUserId);
      onlineUsers.set(currentUserId, socket.id);
      console.log(`User ${currentUserId} connected`);

      io?.emit("user:online_list", Array.from(onlineUsers.keys()));

      socket.broadcast.emit("user:status_changed", {
        userId: currentUserId,
        status: "online",
      });
    });

    socket.on("user:typing", ({ chatId, receiverId }) => {
      if (!receiverId) return;
      socket.to(receiverId.toString()).emit("user:typing_status", {
        chatId,
        isTyping: true,
      });
    });

    socket.on("disconnect", () => {
      if (currentUserId) {
        onlineUsers.delete(currentUserId);

        io?.emit("user:online_list", Array.from(onlineUsers.keys()));

        socket.broadcast.emit("user:status_changed", {
          userId: currentUserId,
          status: "offline",
        });

        console.log(`User ${currentUserId} disconnected`);
      }
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.io has not been initialized. Please call initSocket first.",
    );
  }
  return io;
};
