import { useEffect, useState } from 'react';

const UserCursors = ({ socket, roomId, myColor }) => {
  const [cursors, setCursors] = useState({});
  const [userCount, setUserCount] = useState(1);
  const [connected, setConnected] = useState(socket.connected);

  // Join room + cursor updates
  useEffect(() => {
    if (!roomId) return;

    socket.emit('join-room', roomId);

    socket.on('cursor-update', ({ id, x, y, color }) => {
      setCursors(prev => ({
        ...prev,
        [id]: { x, y, color }
      }));
    });

    socket.on('user-count', (count) => {
      setUserCount(count);
    });

    return () => {
      socket.off('cursor-update');
      socket.off('user-count');
    };
  }, [socket, roomId]);

  //  (throttled)
  useEffect(() => {
    let lastSent = 0;
    const move = (e) => {
      const now = Date.now();
      if (now - lastSent > 100) {
        socket.emit('cursor-move', {
          x: e.clientX,
          y: e.clientY,
          color: myColor,
          roomId,
        });
        lastSent = now;
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [socket, roomId, myColor]);

  // Connection status handling
  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 70,
        left: 10,
        backgroundColor: '#fff',
        padding: '6px 12px',
        borderRadius: '8px',
        boxShadow: '0 0 4px rgba(0,0,0,0.1)',
        fontSize: '14px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: connected ? 'green' : 'red'
        }}></span>
        👥 {userCount} user{userCount > 1 ? 's' : ''} online
      </div>

      {/*All Other Cursors */}
      {Object.entries(cursors).map(([id, cursor]) => (
        <div
          key={id}
          style={{
            position: 'fixed',
            top: cursor.y,
            left: cursor.x,
            backgroundColor: cursor.color,
            border: '2px solid white',
            borderRadius: '50%',
            width: 10,
            height: 10,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 998,
            transition: 'top 0.1s linear, left 0.1s linear'
          }}
        />
      ))}
    </>
  );
};

export default UserCursors;

