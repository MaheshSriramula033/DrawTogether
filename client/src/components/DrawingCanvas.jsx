import React, { useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io("http://localhost:5000");

const DrawingCanvas = ({ strokeColor, strokeWidth, roomId }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const ctx = useRef(null);
  const drawingCommands = useRef([]);
  let lastX, lastY;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    ctx.current = context;

    context.lineJoin = 'round';
    context.lineCap = 'round';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawAll();
    };

    const redrawAll = () => {
      ctx.current.clearRect(0, 0, canvas.width, canvas.height);
      drawingCommands.current.forEach((cmd) => {
        if (cmd.type === 'stroke') {
          const { x0, y0, x1, y1, color, width } = cmd.data;
          drawLine(
            x0 * canvas.width,
            y0 * canvas.height,
            x1 * canvas.width,
            y1 * canvas.height,
            color,
            width,
            false
          );
        } else if (cmd.type === 'clear') {
          ctx.current.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
    };

    const fetchInitialData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
        drawingCommands.current = res.data.drawingData || [];
        resizeCanvas();
      } catch (err) {
        console.error('Error loading drawing data:', err);
      }
    };

    socket.emit('join-room', roomId);
    fetchInitialData();
    window.addEventListener('resize', resizeCanvas);

    socket.on('draw-start', (data) => {
      drawLine(
        data.x0 * canvas.width,
        data.y0 * canvas.height,
        data.x1 * canvas.width,
        data.y1 * canvas.height,
        data.color,
        data.width,
        false
      );
    });

    socket.on('draw-move', (data) => {
      drawLine(
        data.x0 * canvas.width,
        data.y0 * canvas.height,
        data.x1 * canvas.width,
        data.y1 * canvas.height,
        data.color,
        data.width,
        false
      );
    });

    socket.on('clear-canvas', () => {
      drawingCommands.current.push({ type: 'clear' });
      ctx.current.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      socket.off('draw-start');
      socket.off('draw-move');
      socket.off('clear-canvas');
    };
  }, [roomId]);

  const drawLine = (x0, y0, x1, y1, color, width, emit = true, type = 'draw-move') => {
    const context = ctx.current;
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();

    if (!emit) return;

    const canvas = canvasRef.current;
    const normX0 = +(x0 / canvas.width).toFixed(4);
    const normY0 = +(y0 / canvas.height).toFixed(4);
    const normX1 = +(x1 / canvas.width).toFixed(4);
    const normY1 = +(y1 / canvas.height).toFixed(4);

    socket.emit(type, {
      x0: normX0,
      y0: normY0,
      x1: normX1,
      y1: normY1,
      color,
      width,
      roomId
    });

    drawingCommands.current.push({
      type: 'stroke',
      data: { x0: normX0, y0: normY0, x1: normX1, y1: normY1, color, width }
    });
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    lastX = e.nativeEvent.offsetX;
    lastY = e.nativeEvent.offsetY;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    drawLine(lastX, lastY, x, y, strokeColor, strokeWidth, true, 'draw-move');
    lastX = x;
    lastY = y;
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
  };

  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current;
    ctx.current.clearRect(0, 0, canvas.width, canvas.height);
    drawingCommands.current.push({ type: 'clear' });
    if (emit) socket.emit('clear-canvas', roomId);
  };

  window.clearCanvas = clearCanvas;

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', border: '1px solid #ccc' }}
      onMouseDown={(e) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        isDrawing.current = true;
        lastX = x;
        lastY = y;
        drawLine(x, y, x, y, strokeColor, strokeWidth, true, 'draw-start');
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default DrawingCanvas;
