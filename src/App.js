import { useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import CanvasBoard from "./components/CanvasBoard";
import CodePanel from "./components/CodePanel";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [pinConfig, setPinConfig] = useState({ led: 10, button: 2 });
  const [analogValue, setAnalogValue] = useState(512);

  const pinOptions = [2,3,4,5,6,7,8,9,10,11,12,13];

  const updateCode = () => {
    const generated = canvasRef.current?.generateCode();
    if (generated) setCode(generated);
  };

  const handleAddArduino = () => canvasRef.current?.addArduino();
  const handleAddBreadboard = () => canvasRef.current?.addBreadboard();
  
  const handleAddLED = () => {
    canvasRef.current?.addLED();
    setTimeout(updateCode, 100);
  };

  const handleAddButton = () => {
    canvasRef.current?.addButton();
    setTimeout(updateCode, 100);
  };

  const handleAddPotentiometer = () => {
    canvasRef.current?.addPot();
    setTimeout(updateCode, 100);
  };

  const resetSimulator = () => {
    canvasRef.current?.resetSimulator();
    setCode("");
    setIsRunning(false);
  };

  const handleStart = () => setIsRunning(true);
  const handleStop = () => setIsRunning(false);

  // FIXED PIN CHANGE HANDLER
  const handlePinChange = (type, value) => {
    const newPin = parseInt(value, 10);
    const newConfig = { ...pinConfig, [type]: newPin };
    setPinConfig(newConfig);
    
    // Call CanvasBoard update function
    canvasRef.current?.updateComponentPin(type === "led" ? "LED" : "BUTTON", newPin);
    
    setTimeout(updateCode, 100);
  };

  return (
    <div className="app-container">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <Sidebar
        handleAddArduino={handleAddArduino}
        handleAddBreadboard={handleAddBreadboard}
        handleAddLED={handleAddLED}
        handleAddButton={handleAddButton}
        handleAddPotentiometer={handleAddPotentiometer}
        resetSimulator={resetSimulator}
        pinConfig={pinConfig}
        pinOptions={pinOptions}
        handlePinChange={handlePinChange}
        handleAnalogValueChange={setAnalogValue}
        analogValue={analogValue}
      />

      <div className="main-content">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className={`status-indicator ${isRunning ? "running" : ""}`}>
              <span className="status-dot" />
              <span>{isRunning ? "Running" : "Ready"}</span>
            </div>
          </div>
          <div className="toolbar-right">
            <button className="toolbar-btn start-btn" onClick={handleStart} disabled={isRunning}>▶ Start</button>
            <button className="toolbar-btn stop-btn" onClick={handleStop} disabled={!isRunning}>■ Stop</button>
          </div>
        </div>

        <div className="canvas-wrapper">
          <CanvasBoard
            ref={canvasRef}
            isRunning={isRunning}
            pinConfig={pinConfig}
            analogValue={analogValue}
          />
        </div>

        <div className="code-wrapper">
          <CodePanel code={code} />
        </div>
      </div>
    </div>
  );
}

export default App;