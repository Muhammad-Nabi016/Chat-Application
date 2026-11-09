const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const messageRoutes = require("./routes/messages");
const jwt = require("jsonwebtoken");
const ChatRoom = require("./models/ChatRoom");
const Message = require("./models/Message");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Basic API route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Chat Application Backend is Running"
    });
});

// Authenticate Socket Connections
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.user = decoded;

        next();

    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
});

// Real-Time Messaging
io.on("connection", (socket) => {
    console.log("User connected:", socket.user.userId);

    // Join Chat Room
    socket.on("join_room", async (roomId) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(roomId)) {
                return socket.emit("chat_error", "Invalid room ID");
            }

            const room = await ChatRoom.findOne({
                _id: roomId,
                members: socket.user.userId
            });

            if (!room) {
                return socket.emit(
                    "chat_error",
                    "You are not a member of this room"
                );
            }

            socket.join(roomId);

            console.log("User joined room:", roomId);

        } catch (error) {
            socket.emit("chat_error", "Unable to join room");
        }
    });

    // Send Message
    socket.on("send_message", async (data) => {
        try {
            const { roomId, content } = data;

            if (!roomId || !content || !content.trim()) {
                return socket.emit(
                    "chat_error",
                    "Message cannot be empty"
                );
            }

            if (!mongoose.Types.ObjectId.isValid(roomId)) {
                return socket.emit("chat_error", "Invalid room ID");
            }

            const room = await ChatRoom.findOne({
                _id: roomId,
                members: socket.user.userId
            });

            if (!room) {
                return socket.emit(
                    "chat_error",
                    "You are not a member of this room"
                );
            }

            const message = await Message.create({
                room: roomId,
                sender: socket.user.userId,
                content: content.trim()
            });

            const populatedMessage = await Message.findById(message._id)
                .populate("sender", "name email");

            io.to(roomId).emit(
                "receive_message",
                populatedMessage
            );

        } catch (error) {
            socket.emit("chat_error", "Message could not be sent");
        }
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.user.userId);
    });
});


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
        console.log("Database Name:", mongoose.connection.name);

        server.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error.message);
    });