import React, { useState } from 'react';

const RoomJoin = ({ onJoin }) => {
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim().length < 6 || roomCode.trim().length > 8) {
      alert('Room code must be 6–8 alphanumeric characters.');
      return;
    }
    onJoin(roomCode);
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>🎨 Join a Whiteboard Room</h2>

        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter room code (6–8 chars)"
          maxLength={8}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Join Room
        </button>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem 3rem',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease',
  },
  heading: {
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.5rem',
  },
  input: {
    padding: '0.75rem',
    width: '100%',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    marginBottom: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#667eea',
    color: '#fff',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  }
};

// Add the fadeIn animation style to the page once
if (!document.getElementById('fadeIn-animation-style')) {
  const style = document.createElement('style');
  style.id = 'fadeIn-animation-style';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}


export default RoomJoin;
