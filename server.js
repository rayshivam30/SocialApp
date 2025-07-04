const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId); // Each user joins their own room
  });

  socket.on("send_message", (data) => {
    // data: { to, from, content }
    io.to(data.to).emit("receive_message", data);
  });
});

httpServer.listen(4000, () => {
  console.log("Socket.IO server running on port 4000");
}); 