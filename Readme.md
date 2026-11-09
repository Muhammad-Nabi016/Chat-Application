# Real-Time Chat Application

A full-stack real-time chat application built using the MERN stack and Socket.IO. Users can register, log in, create chat rooms, join existing rooms, and exchange messages instantly.

## Features

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected API routes
- Create and join chat rooms
- Real-time messaging using Socket.IO
- Store and retrieve chat history from MongoDB
- Display sender information with messages
- Responsive chat interface

## Technologies Used

**Frontend**
- React.js
- Vite
- Axios
- Socket.IO Client
- React Router DOM
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs
- dotenv

## Project Structure

```text
Chat Application/
│
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── ChatRoom.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── rooms.js
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Muhammad-Nabi016/Chat-Application
cd "Chat Application"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL provided by Vite, usually:

```text
http://localhost:5173
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/rooms` | Get chat rooms |
| POST | `/api/rooms` | Create a room |
| POST | `/api/rooms/:id/join` | Join a room |
| GET | `/api/messages/:roomId` | Get room messages |

## Real-Time Events

| Event | Purpose |
|---|---|
| `join_room` | Join a chat room |
| `send_message` | Send a message |
| `receive_message` | Receive new messages |
| `chat_error` | Receive chat errors |

## Security

- Passwords are hashed before storage.
- JWT authentication protects private routes.
- Socket.IO connections require a valid JWT.
- Room membership is checked before joining and sending messages.
- Environment variables are used for sensitive configuration.

## Author

**Muhammad Nabi**

Developed as a full-stack real-time chat application project.