
const Toolbar = ({ color, setColor, stroke, setStroke }) => {
  return (
    <div style={{
      padding: '0.5rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      background: '#f5f5f5'
    }}>
      <label>
        Stroke Width:
        <input
          type="range"
          min="1"
          max="20"
          value={stroke}
          onChange={(e) => setStroke(parseInt(e.target.value))}
        />
      </label>

      <label>
        Color:
        <select value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="black">Black</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
        </select>
      </label>

      <button onClick={() => window.clearCanvas()}>Clear</button>
    </div>
  );
};

export default Toolbar;
