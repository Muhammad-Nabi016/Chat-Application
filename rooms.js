
const express = require("express");
const mongoose = require("mongoose");
const ChatRoom = require("../models/ChatRoom");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create Chat Room
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Room name is required"
            });
        }

        const room = await ChatRoom.create({
            name: name.trim(),
            members: [req.user.userId],
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: "Chat room created successfully",
            room
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get All Chat Rooms
router.get("/", authMiddleware, async (req, res) => {
    try {
        const rooms = await ChatRoom.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            rooms
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Join Chat Room
router.post("/:id/join", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room ID"
            });
        }

        const room = await ChatRoom.findByIdAndUpdate(
            id,
            {
                $addToSet: {
                    members: req.user.userId
                }
            },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Chat room not found"
            });
        }

        res.json({
            success: true,
            message: "Joined chat room successfully",
            room
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
