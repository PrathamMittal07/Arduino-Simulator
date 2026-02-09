import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";
import { Canvas, FabricImage, Line, Circle, Polyline } from "fabric";

import usePins from "../hooks/usePins";
import useCircuit from "../hooks/useCircuit";

import arduinoImg from "../assets/arduino.png";
import ledImg from "../assets/led.png";
import buttonImg from "../assets/button.png";
import breadboardImg from "../assets/breadboard.png";
import potImg from "../assets/potentiometer.png";

const BASE_WIDTH = 795;
const BASE_HEIGHT = 569;

// --- CALIBRATION COORDINATES ---
const D13_CENTER = { x: 374, y: 25 };
const D2_CENTER = { x: 687, y: 26 };

// FIXED A0: 602 lands squarely on the first pin of the Analog Header
const A0_CENTER = { x: 602, y: 535 }; 

const CanvasBoard = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const arduinoRef = useRef(null);
  const isRunningRef = useRef(props.isRunning);
  const simInterval = useRef(null);
  const analogValueRef = useRef(props.analogValue);

  const ledY = useRef(100);
  const buttonY = useRef(100);
  const potY = useRef(100);

  const { assignPin, resetPins } = usePins();
  const { circuit, resetCircuit, setPinState } = useCircuit();

  // --- SYNC PROPS ---
  useEffect(() => {
    isRunningRef.current = props.isRunning;
    analogValueRef.current = props.analogValue;
    if (props.isRunning) startSimulation();
    else stopSimulation();
  }, [props.isRunning, props.analogValue]);

  // --- INIT CANVAS ---
  useEffect(() => {
    const canvas = new Canvas("canvas", {
      width: window.innerWidth - 260,
      height: window.innerHeight * 0.85,
      backgroundColor: "#0b1220",
      selection: false
    });

    canvasRef.current = canvas;
    drawGrid(canvas);

    canvas.on("mouse:down", (e) => {
      if (!isRunningRef.current) return;
      if (e.target?.componentType === "BUTTON") setPinState(e.target.pin, "LOW");
    });

    canvas.on("mouse:up", (e) => {
      if (e.target?.componentType === "BUTTON") setPinState(e.target.pin, "HIGH");
    });

    canvas.on("object:moving", (e) => {
      snapToGrid(e.target);
      if (e.target.componentType === "ARDUINO") updateArduinoPins(e.target);
      if (e.target.wire) updateWirePath(e.target);
    });

    return () => {
      canvas.dispose();
      stopSimulation();
    };
  }, []);

  const startSimulation = () => {
    if (simInterval.current) clearInterval(simInterval.current);
    simInterval.current = setInterval(() => {
      const isButtonPressed = Object.values(circuit.current.pinLogic).includes("LOW");
      const speed = 50 + (analogValueRef.current / 1023) * 950;

      circuit.current.LEDs.forEach(led => {
        if (isButtonPressed) {
          led.set({ shadow: "0 0 30px rgba(255, 60, 60, 1)" });
        } else {
          const now = Date.now();
          if (Math.floor(now / speed) % 2 === 0) {
             led.set({ shadow: "0 0 15px rgba(255, 60, 60, 0.5)" });
          } else {
             led.set({ shadow: null });
          }
        }
      });
      canvasRef.current?.renderAll();
    }, 50);
  };

  const stopSimulation = () => {
    if (simInterval.current) clearInterval(simInterval.current);
    circuit.current.LEDs.forEach(led => led.set({ shadow: null }));
    canvasRef.current?.renderAll();
  };

  const drawGrid = (canvas) => {
    const gridSize = 25;
    for (let i = 0; i < canvas.width / gridSize; i++) {
      canvas.add(new Line([i * gridSize, 0, i * gridSize, canvas.height], { stroke: "#1f2a3a", selectable: false, evented: false }));
      canvas.add(new Line([0, i * gridSize, canvas.width, i * gridSize], { stroke: "#1f2a3a", selectable: false, evented: false }));
    }
  };

  const snapToGrid = (obj) => {
    const grid = 25;
    obj.left = Math.round(obj.left / grid) * grid;
    obj.top = Math.round(obj.top / grid) * grid;
  };

  // --- PIN CREATION ---
  const createPins = (arduino) => {
    const canvas = canvasRef.current;
    const scaleX = arduino.getScaledWidth() / BASE_WIDTH;
    const scaleY = arduino.getScaledHeight() / BASE_HEIGHT;
    const spacing = (D2_CENTER.x - D13_CENTER.x) / 11;

    arduino.pins = [];

    // Digital Pins 13-2
    for (let i = 0; i < 12; i++) {
      const pin = new Circle({
        left: arduino.left + (D13_CENTER.x + i * spacing) * scaleX,
        top: arduino.top + D13_CENTER.y * scaleY,
        radius: 4, fill: "#ffffff", stroke: "#0f172a", strokeWidth: 1.2,
        selectable: false, evented: false
      });
      pin.pinNumber = 13 - i;
      pin.offsetX = pin.left - arduino.left;
      pin.offsetY = pin.top - arduino.top;
      arduino.pins.push(pin);
      canvas.add(pin);
    }

    // A0 Pin (Fixed Location)
    const pinA0 = new Circle({
        left: arduino.left + A0_CENTER.x * scaleX,
        top: arduino.top + A0_CENTER.y * scaleY,
        radius: 4, fill: "#fff", stroke: "#000", strokeWidth: 1,
        selectable: false, evented: false
    });
    pinA0.pinNumber = "A0";
    pinA0.offsetX = pinA0.left - arduino.left;
    pinA0.offsetY = pinA0.top - arduino.top;
    arduino.pins.push(pinA0);
    canvas.add(pinA0);
  };

  const updateArduinoPins = (arduino) => {
    if (!arduino.pins) return;
    arduino.pins.forEach((pin) => {
      pin.set({ left: arduino.left + pin.offsetX, top: arduino.top + pin.offsetY });
      pin.setCoords();
      
      const all = [...circuit.current.LEDs, ...circuit.current.BUTTONS, ...circuit.current.POTENTIOMETERS];
      all.forEach(comp => {
         if (comp.wire?.fromPin === pin) updateWirePath(comp);
      });
    });
    canvasRef.current.renderAll();
  };

  // --- WIRE LOGIC (Fixed Overlap & Routing) ---
  const updateWirePath = (component) => {
    if (!component.wire || !component.wire.fromPin) return;
    
    const pin = component.wire.fromPin;
    const start = { x: pin.left + pin.radius, y: pin.top + pin.radius };
    const end = component.getCenterPoint();

    const isAnalog = typeof pin.pinNumber === "string" && pin.pinNumber.startsWith("A");
    
    // VISUAL FIX: Add a unique offset based on pin number so wires don't overlap
    // Digital Pins (2-13): Stagger upwards
    // Analog Pins: Stagger downwards
    const pinOffset = (typeof pin.pinNumber === 'number' ? pin.pinNumber : 0) * 4; 
    
    // Calculate clearance level with staggering
    const clearanceY = isAnalog 
      ? start.y + 60             // Analog goes down
      : start.y - 40 - pinOffset; // Digital goes up and staggers

    const points = [
      start,
      { x: start.x, y: clearanceY },
      { x: end.x, y: clearanceY },
      end
    ];

    component.wire.set({ points: points });
    
    if (canvasRef.current) {
        canvasRef.current.bringObjectToFront(component.wire);
    }
  };

  const drawOrthogonalWire = (component, pinObj) => {
    const start = { x: pinObj.left + pinObj.radius, y: pinObj.top + pinObj.radius };
    const end = component.getCenterPoint();
    
    const points = [start, end]; 
    const color = component.componentType === "LED" ? "#f85149" : 
                  component.componentType === "BUTTON" ? "#58a6ff" : "#d29922";

    const wire = new Polyline(points, {
      stroke: color, strokeWidth: 3, fill: 'transparent',
      selectable: false, evented: false, strokeLineJoin: 'round',
      objectCaching: false
    });

    wire.fromPin = pinObj;
    component.wire = wire;
    
    canvasRef.current.add(wire);
    updateWirePath(component);
  };

  // --- ADD COMPONENTS ---
  const addArduino = async () => {
    if (arduinoRef.current) return;
    const img = await FabricImage.fromURL(arduinoImg);
    
    img.set({ 
        left: 300, 
        top: 200, 
        originX: "left", 
        originY: "top", 
        componentType: "ARDUINO" 
    });
    img.scaleToWidth(380);
    
    canvasRef.current.add(img);
    img.setCoords();
    createPins(img);
    arduinoRef.current = img;
    canvasRef.current.renderAll();
  };

  const addBreadboard = async () => {
    const img = await FabricImage.fromURL(breadboardImg);
    img.set({ left: 50, top: 400, componentType: "BREADBOARD", selectable: true });
    img.scaleToWidth(400);
    canvasRef.current.add(img);
    canvasRef.current.sendObjectToBack(img);
    canvasRef.current.renderAll();
  };

  const addComponent = async (imgUrl, width, type) => {
    if (!arduinoRef.current) return alert("Add Arduino first");

    // Default Pins matching Sidebar defaults
    let pinNumber;
    if (type === "POT") pinNumber = "A0";
    else if (type === "LED") pinNumber = 10;
    else if (type === "BUTTON") pinNumber = 2;
    else pinNumber = assignPin();

    const pinObj = arduinoRef.current.pins.find(p => p.pinNumber === pinNumber);
    const img = await FabricImage.fromURL(imgUrl);

    let left = 200, top = 100;
    if (type === "LED") { left = 700; top = ledY.current; ledY.current += 100; }
    if (type === "BUTTON") { left = 150; top = buttonY.current; buttonY.current += 100; }
    if (type === "POT") { left = 150; top = potY.current; potY.current += 100; }

    img.set({ 
        left, 
        top, 
        componentType: type, 
        pin: pinNumber, 
        originX: 'center', 
        originY: 'center' 
    });
    img.scaleToWidth(width);
    
    canvasRef.current.add(img);
    img.setCoords(); // Critical for wire attachment
    
    if (pinObj) {
        drawOrthogonalWire(img, pinObj);
    }

    if (type === "LED") circuit.current.LEDs.push(img);
    if (type === "BUTTON") { 
        circuit.current.BUTTONS.push(img); 
        setPinState(pinNumber, "HIGH"); 
    }
    if (type === "POT") circuit.current.POTENTIOMETERS.push(img);
    
    canvasRef.current.renderAll();
  };

  const updateComponentPin = (type, newPin) => {
    const list = type === "LED" ? circuit.current.LEDs : circuit.current.BUTTONS;
    const component = list[0]; 
    if (!component || !arduinoRef.current) return;

    component.pin = parseInt(newPin);

    if (component.wire) {
        canvasRef.current.remove(component.wire);
    }

    const pinObj = arduinoRef.current.pins.find(p => p.pinNumber === component.pin);
    if (pinObj) {
        drawOrthogonalWire(component, pinObj);
    }
    canvasRef.current.renderAll();
  };

  const generateCode = () => {
    let setup = "void setup() {\n";
    let loop = "void loop() {\n";
    circuit.current.LEDs.forEach(led => setup += `  pinMode(${led.pin}, OUTPUT);\n`);
    circuit.current.BUTTONS.forEach(btn => setup += `  pinMode(${btn.pin}, INPUT_PULLUP);\n`);
    loop += `  // Logic Loop\n`;
    circuit.current.BUTTONS.forEach(btn => {
      loop += `  if(digitalRead(${btn.pin}) == LOW) {\n    digitalWrite(${circuit.current.LEDs[0]?.pin || 13}, HIGH);\n  } else {\n    digitalWrite(${circuit.current.LEDs[0]?.pin || 13}, LOW);\n  }\n`;
    });
    return `${setup}}\n\n${loop}}`;
  };

  const resetSimulator = () => {
    canvasRef.current?.clear();
    drawGrid(canvasRef.current);
    resetPins();
    resetCircuit();
    arduinoRef.current = null;
    ledY.current = 100; buttonY.current = 100; potY.current = 100;
  };

  useImperativeHandle(ref, () => ({
    addArduino,
    addBreadboard,
    addLED: () => addComponent(ledImg, 60, "LED"),
    addButton: () => addComponent(buttonImg, 70, "BUTTON"),
    addPot: () => addComponent(potImg, 80, "POT"),
    generateCode,
    resetSimulator,
    updateComponentPin
  }));

  return <div style={{ width: "100%", height: "100%" }}><canvas id="canvas" /></div>;
});

export default CanvasBoard;