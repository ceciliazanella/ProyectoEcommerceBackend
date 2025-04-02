import { Server } from "socket.io";

export const config = (httpServer) => {
  const socketServer = new Server(httpServer);

  socketServer.on("connection", async (socket) => {
    console.log("🔗 Ya estás conectado! :)", socket.id);

    socket.on("error", (errorMessage) => {
      socket.emit("error-message", { message: errorMessage });
    });

    socket.on("disconnect", () => {
      console.log("❌ Mmm... te desconectaste :(", socket.id);
    });
  });
};
