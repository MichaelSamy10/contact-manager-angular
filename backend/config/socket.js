const jwt = require("jsonwebtoken");
const Contact = require("../models/Contact");

const connectedUsers = new Map();

const handleSocketConnection = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.username} connected`);
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.username,
    });

    // Join user to their personal room
    socket.join(socket.userId);

    // Handle contact locking
    socket.on("lock-contact", async (contactId) => {
      try {
        const contact = await Contact.findById(contactId);
        if (!contact) {
          socket.emit("lock-error", { message: "Contact not found" });
          return;
        }

        if (contact.isLocked && contact.lockedBy.toString() !== socket.userId) {
          const lockedByUser = connectedUsers.get(contact.lockedBy.toString());
          socket.emit("lock-error", {
            message: `Contact is already being edited by ${
              lockedByUser?.username || "another user"
            }`,
          });
          return;
        }

        // Lock the contact
        contact.isLocked = true;
        contact.lockedBy = socket.userId;
        contact.lockedAt = new Date();
        await contact.save();

        // Notify all other clients
        socket.broadcast.emit("contact-locked", {
          contactId,
          lockedBy: socket.userId,
          username: socket.username,
        });

        socket.emit("lock-acquired", { contactId });
      } catch (error) {
        socket.emit("lock-error", { message: "Failed to lock contact" });
      }
    });

    // Handle contact unlocking
    socket.on("unlock-contact", async (contactId) => {
      try {
        const contact = await Contact.findById(contactId);
        if (
          contact &&
          contact.lockedBy &&
          contact.lockedBy.toString() === socket.userId
        ) {
          contact.isLocked = false;
          contact.lockedBy = null;
          contact.lockedAt = null;
          await contact.save();

          // Notify all clients
          io.emit("contact-unlocked", { contactId });
        }
      } catch (error) {
        console.error("Error unlocking contact:", error);
      }
    });

    // Handle contact updates
    socket.on("contact-updated", (contactData) => {
      socket.broadcast.emit("contact-updated", contactData);
    });

    // Handle contact deletion
    socket.on("contact-deleted", (contactId) => {
      socket.broadcast.emit("contact-deleted", { contactId });
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User ${socket.username} disconnected`);

      // Unlock all contacts locked by this user
      try {
        await Contact.updateMany(
          { lockedBy: socket.userId },
          {
            isLocked: false,
            lockedBy: null,
            lockedAt: null,
          }
        );

        // Notify all clients about unlocked contacts
        socket.broadcast.emit("user-disconnected", { userId: socket.userId });
      } catch (error) {
        console.error("Error cleaning up locks on disconnect:", error);
      }

      connectedUsers.delete(socket.userId);
    });
  });
};

module.exports = { handleSocketConnection, connectedUsers };
