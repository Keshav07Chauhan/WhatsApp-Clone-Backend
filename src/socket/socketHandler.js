// socket/socketHandler.js
import { Message } from "../models/message.model.js";

export const setupSocket = (io) => {
  const onlineUsers = new Map(); // wa_id => socket.id

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins with wa_id
    socket.on("join", (wa_id) => {
      onlineUsers.set(wa_id, socket.id);
      console.log(`${wa_id} is online`);
    });

    // Send a message
    socket.on("send_message", async (data) => {
      const { from, to, text, type, media, mediaPublicId } = data;

      const message = await Message.create({
        from,
        to,
        text,
        type: type || (media ? "media" : "text"),
        media,
        mediaPublicId,
        status: "created"
      });

      // Update status to sent
      message.status = "sent";
      await message.save();

      // Emit to receiver if online
      if (onlineUsers.has(to)) {
        io.to(onlineUsers.get(to)).emit("receive_message", message);
        message.status = "delivered";
        await message.save();
        io.to(onlineUsers.get(from)).emit("message_status_update", {
          id: message._id,
          status: "delivered"
        });
      }

      // Emit to sender
      io.to(onlineUsers.get(from)).emit("message_status_update", {
        id: message._id,
        status: message.status
      });
    });

    // Mark messages as read
    socket.on("mark_read", async ({ from, to }) => {
      await Message.updateMany(
        { from, to, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );
      if (onlineUsers.has(from)) {
        io.to(onlineUsers.get(from)).emit("messages_marked_read", { by: to });
      }
    });

    socket.on("disconnect", () => {
      for (let [wa_id, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(wa_id);
          console.log(`${wa_id} went offline`);
        }
      }
    });
  });
};
