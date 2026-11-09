
const express = require("express");
const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get Chat History
router.get("/:roomId", authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID"
            });
        }

        const room = await ChatRoom.findOne({
            _id: roomId,
            members: req.user.userId
        });

        if (!room) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this room"
            });
        }

        const messages = await Message.find({
            room: roomId
        })
            .populate("sender", "name email")
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
