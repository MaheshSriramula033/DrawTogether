const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Room = require("./models/Room");
const cron = require('node-cron');
require('dotenv').config();

const userCursors = new Map();   
const roomUsers = new Map();     

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.send('Whiteboard API running');
});


app.post('/api/rooms/join', async (req, res) => {
  const { roomId } = req.body;

  if (!roomId || roomId.length < 6 || roomId.length > 8) {
    return res.status(400).json({ error: 'Invalid room code' });
  }

  try {
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = new Room({ roomId });
      await room.save();
    } else {
      room.lastActivity = new Date();
      await room.save();
    }

    res.status(200).json({ success: true, roomId: room.roomId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    res.json({ drawingData: room.drawingData || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
    roomUsers.get(roomId).add(socket.id);
    io.to(roomId).emit('user-count', roomUsers.get(roomId).size);
  });

  // Events
  socket.on('draw-start', async (data) => {
    const { roomId, ...command } = data;
    socket.to(roomId).emit('draw-start', command);

    await Room.updateOne(
      { roomId },
      {
        $push: {
          drawingData: {
            type: 'stroke',
            data: command,
            timestamp: new Date()
          }
        },
        $set: { lastActivity: new Date() }
      }
    );
  });

  socket.on('draw-move', async (data) => {
    const { roomId, ...command } = data;
    socket.to(roomId).emit('draw-move', command);

    await Room.updateOne(
      { roomId },
      {
        $push: {
          drawingData: {
            type: 'stroke',
            data: command,
            timestamp: new Date()
          }
        },
        $set: { lastActivity: new Date() }
      }
    );
  });

  socket.on('draw-end', (roomId) => {
  //drawing end
  });

  socket.on('clear-canvas', async (roomId) => {
    socket.to(roomId).emit('clear-canvas');

    await Room.updateOne(
      { roomId },
      {
        $push: {
          drawingData: {
            type: 'clear',
            timestamp: new Date()
          }
        },
        $set: { lastActivity: new Date() }
      }
    );
  });

  socket.on('cursor-move', ({ x, y, color, roomId }) => {
    userCursors.set(socket.id, { x, y, color });
    socket.to(roomId).emit('cursor-update', { id: socket.id, x, y, color });
  });

  socket.on('disconnect', () => {
    userCursors.delete(socket.id);

    for (const [roomId, users] of roomUsers) {
      users.delete(socket.id);
      if (users.size === 0) {
        roomUsers.delete(roomId);
      } else {
        io.to(roomId).emit('user-count', users.size);
      }
    }

    console.log('User disconnected:', socket.id);
  });
});

//  Clean up old rooms
cron.schedule('0 * * * *', async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const result = await Room.deleteMany({ lastActivity: { $lt: cutoff } });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} inactive room(s).`);
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
});

server.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});
