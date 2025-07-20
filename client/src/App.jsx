// File: client/src/App.jsx
import React, { useState } from 'react';
import RoomJoin from './components/RoomJoin';
import DrawingCanvas from './components/DrawingCanvas';
import Toolbar from './components/Toolbar';
import UserCursors from './components/UserCursors';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function App() {
  const [roomId, setRoomId] = useState(null);
  const [roomReady, setRoomReady] = useState(false);
  const [stroke, setStroke] = useState(4);
  const [color, setColor] = useState('black');

  const randomColor = React.useMemo(() => {
    const colors = ['orange', 'violet', 'green', 'blue', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const handleJoin = async (roomCode) => {
    try {
      const res = await axios.post('http://localhost:5000/api/rooms/join', {
        roomId: roomCode.trim()
      });
      setRoomId(res.data.roomId);
      setRoomReady(true);
    } catch (err) {
      alert('Failed to join or create room.');
    }
  };

  return (
    <div>
      {!roomReady ? (
        <RoomJoin onJoin={handleJoin} />
      ) : (
        <>
          <Toolbar color={color} setColor={setColor} stroke={stroke} setStroke={setStroke} />
          <UserCursors socket={socket} roomId={roomId} myColor={randomColor} />
          <DrawingCanvas strokeColor={color} strokeWidth={stroke} roomId={roomId} />
        </>
      )}
    </div>
  );
}

export default App;


