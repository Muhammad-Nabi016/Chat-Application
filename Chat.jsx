import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

function Chat() {
    const { user, token, logout } = useAuth();

    const [rooms, setRooms] = useState([]);
    const [roomName, setRoomName] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    // Load chat rooms
    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${API_URL}/rooms`, { headers });
            setRooms(response.data.rooms);
        } catch (err) {
            setError("Unable to load chat rooms");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // Connect Socket.IO
    useEffect(() => {
        if (!token) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token }
        });

        newSocket.on("connect_error", () => {
            setError("Socket connection failed");
        });

        newSocket.on("connect", () => {
            setError("");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    // Create room
    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!roomName.trim()) return;

        try {
            const response = await axios.post(
                `${API_URL}/rooms`,
                { name: roomName },
                { headers }
            );

            setRooms((prev) => [response.data.room, ...prev]);
            setSelectedRoom(response.data.room);
            setRoomName("");
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to create room");
        }
    };

    // Join room
    const handleJoinRoom = async (room) => {
        try {
            const response = await axios.post(
                `${API_URL}/rooms/${room._id}/join`,
                {},
                { headers }
            );

            setSelectedRoom(response.data.room);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to join room");
        }
    };

    // Load message history and join Socket.IO room
    useEffect(() => {
        if (!socket || !selectedRoom) return;

        const roomId = selectedRoom._id;

        const handleReceiveMessage = (message) => {
            if (String(message.room) === String(roomId)) {
                setMessages((prev) => [...prev, message]);
            }
        };

        const handleChatError = (message) => {
            setError(message);
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("chat_error", handleChatError);

        socket.emit("join_room", roomId);

        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/messages/${roomId}`,
                    { headers }
                );

                setMessages(response.data.messages);
            } catch (err) {
                setError("Unable to load messages");
            }
        };

        setMessages([]);
        fetchMessages();

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("chat_error", handleChatError);
        };
    }, [socket, selectedRoom, token]);

    // Send message
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!messageText.trim() || !selectedRoom || !socket) return;

        socket.emit("send_message", {
            roomId: selectedRoom._id,
            content: messageText.trim()
        });

        setMessageText("");
    };

    return (
        <div className="chat-dashboard">
            <header className="chat-header">
                <h2>Chat Application</h2>

                <div className="user-info">
                    <span>Welcome, {user?.name}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <main className="rooms-container">
                <section className="rooms-sidebar">
                    <h2>Chat Rooms</h2>

                    <form
                        onSubmit={handleCreateRoom}
                        className="create-room-form"
                    >
                        <input
                            type="text"
                            placeholder="Enter room name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                        />

                        <button type="submit">Create Room</button>
                    </form>

                    {error && <p className="error-message">{error}</p>}

                    {loading ? (
                        <p>Loading rooms...</p>
                    ) : rooms.length === 0 ? (
                        <p>No chat rooms available.</p>
                    ) : (
                        <div className="rooms-list">
                            {rooms.map((room) => (
                                <div
                                    className={`room-item ${
                                        selectedRoom?._id === room._id ? "selected-room" : ""
                                        }`}
                                        key={room._id}
                                >
                                    <div>
                                        <h3>{room.name}</h3>
                                        <small>
                                            Created by: {room.createdBy?.name || "User"}
                                        </small>
                                    </div>

                                    <button onClick={() => handleJoinRoom(room)}>
                                        Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="room-preview">
                    {selectedRoom ? (
                        <>
                            <h2>{selectedRoom.name}</h2>

                            <div className="messages-container">
                                {messages.length === 0 ? (
                                    <p>No messages yet. Start the conversation!</p>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message._id}
                                            className={
                                                String(message.sender?._id) === String(user?.id)
                                                    ? "message own-message"
                                                    : "message"
                                            }
                                        >
                                            <strong>
                                                {message.sender?.name || "User"}
                                            </strong>

                                            <p>{message.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form
                                onSubmit={handleSendMessage}
                                className="message-form"
                            >
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    required
                                />

                                <button type="submit">Send</button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2>Welcome to Chat</h2>
                            <p>Create a new room or join an existing room to continue.</p>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Chat;
