import React from "react";

function Sidebar({
  handleAddArduino,
  handleAddLED,
  handleAddButton,
  handleAddBreadboard,
  handleAddPotentiometer,
  resetSimulator,
  pinConfig,
  pinOptions,
  handlePinChange,
  handleAnalogValueChange,
  analogValue
}) {
  // --- STRICT PIN CONSTRAINT ---
  // Rule 1: The LED dropdown shows all pins EXCEPT the one currently assigned to the Button.
  const ledOptions = pinOptions.filter(
    (pin) => pin !== pinConfig.button
  );

  // Rule 2: The Button dropdown shows all pins EXCEPT the one currently assigned to the LED.
  const buttonOptions = pinOptions.filter(
    (pin) => pin !== pinConfig.led
  );

  const handleDragStart = (event, type) => {
    event.dataTransfer.setData("componentType", type);
  };

  return (
    <div
      style={{
        width: "260px",
        background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
        color: "#e2e8f0",
        borderRight: "1px solid #1f2937",
        padding: "20px",
        fontWeight: "600",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        overflowY: "auto"
      }}
    >
      <div style={{ fontSize: "16px", marginBottom: "10px", color: "#58a6ff" }}>
        ⚡ Components
      </div>

      {/* Draggable Component List */}
      <div onClick={handleAddArduino} style={boxStyle} draggable onDragStart={(e) => handleDragStart(e, "ARDUINO")}>
        🧠 Arduino Uno
      </div>
      <div onClick={handleAddBreadboard} style={boxStyle} draggable onDragStart={(e) => handleDragStart(e, "BREADBOARD")}>
        🍞 Breadboard
      </div>
      <div onClick={handleAddLED} style={boxStyle} draggable onDragStart={(e) => handleDragStart(e, "LED")}>
        💡 LED (Red)
      </div>
      <div onClick={handleAddButton} style={boxStyle} draggable onDragStart={(e) => handleDragStart(e, "BUTTON")}>
        🔘 Push Button
      </div>
      <div onClick={handleAddPotentiometer} style={boxStyle} draggable onDragStart={(e) => handleDragStart(e, "POT")}>
        🎡 Potentiometer
      </div>

      {/* Pin Settings with Mutual Exclusion */}
      <div style={{ marginTop: "20px", fontSize: "14px", color: "#94a3b8", borderTop: "1px solid #334155", paddingTop: "15px" }}>
        Pin Settings
      </div>

      <div style={labelStyle}>LED Digital Pin</div>
      <select 
        value={pinConfig.led} 
        onChange={(e) => handlePinChange("led", e.target.value)} 
        style={selectStyle}
      >
        {ledOptions.map((pin) => (
          <option key={pin} value={pin}>D{pin}</option>
        ))}
      </select>

      <div style={labelStyle}>Button Digital Pin</div>
      <select 
        value={pinConfig.button} 
        onChange={(e) => handlePinChange("button", e.target.value)} 
        style={selectStyle}
      >
        {buttonOptions.map((pin) => (
          <option key={pin} value={pin}>D{pin}</option>
        ))}
      </select>

      {/* Sensor Simulation */}
      <div style={{ marginTop: "20px", fontSize: "14px", color: "#94a3b8" }}>
        Sensor Simulation
      </div>
      <div style={labelStyle}>Analog Input (A0): {analogValue}</div>
      <input 
        type="range" 
        min="0" 
        max="1023" 
        value={analogValue} 
        onChange={(e) => handleAnalogValueChange(e.target.value)}
        style={{ width: '100%', cursor: 'pointer', accentColor: '#58a6ff' }}
      />

      {/* Reset Button */}
      <div
        onClick={resetSimulator}
        style={{
          marginTop: "auto",
          padding: "12px",
          background: "#da3633",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          textAlign: "center",
          transition: "background 0.2s",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
        }}
      >
        Reset Canvas
      </div>
    </div>
  );
}

// --- STYLES ---
const boxStyle = {
  padding: "12px",
  background: "#1e293b",
  borderRadius: "10px",
  cursor: "pointer",
  border: "1px solid #334155",
  color: "#e2e8f0",
  fontSize: "13px",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const labelStyle = {
  marginTop: "10px",
  fontSize: "12px",
  color: "#cbd5e1"
};

const selectStyle = {
  marginTop: "5px",
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: "13px",
  outline: "none"
};

export default Sidebar;