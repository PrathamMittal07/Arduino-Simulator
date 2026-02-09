import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";

import { Canvas, FabricImage, Line, Circle } from "fabric";

import usePins from "../hooks/usePins";
import useCircuit from "../hooks/useCircuit";
import { drawWire } from "../utils/wireUtils";

import arduinoImg from "../assets/arduino.png";
import ledImg from "../assets/led.png";
import buttonImg from "../assets/button.png";

const BASE_WIDTH = 795;
const BASE_HEIGHT = 569;

// Top digital pin row centers (D13 → D2)
const D13_CENTER = { x: 374, y: 25 };
const D2_CENTER = { x: 687, y: 26 };

const CanvasBoard = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const arduinoRef = useRef(null);
  const isRunningRef = useRef(props.isRunning);

  const ledY = useRef(120);
  const buttonY = useRef(120);

  const { assignPin, resetPins } = usePins();
  const { circuit, resetCircuit } = useCircuit();

  useEffect(() => {
    isRunningRef.current = props.isRunning;
  }, [props.isRunning]);

  useEffect(() => {
    const canvas = new Canvas("canvas", {
      width: window.innerWidth - 260,
      height: window.innerHeight * 0.65,
      backgroundColor: "#0b1220",
      selection: false
    });

    canvasRef.current = canvas;

    drawGrid(canvas);

    canvas.on("mouse:down", (event) => {
      const obj = event.target;
      if (obj?.componentType === "BUTTON" && isRunningRef.current) {
        turnOnLED();
      }
    });

    canvas.on("mouse:up", (event) => {
      const obj = event.target;
      if (obj?.componentType === "BUTTON" && isRunningRef.current) {
        turnOffLED();
      }
    });

    canvas.on("object:moving", (event) => {
      const obj = event.target;

      snapToGrid(obj);

      if (obj?.componentType === "ARDUINO") {
        updateArduinoPins(obj);
      }

      if (!obj.wire) return;

      const pin = obj.wire.fromPin;
      const center = obj.getCenterPoint();

      obj.wire.set({
        x1: pin.left + pin.radius,
        y1: pin.top + pin.radius,
        x2: center.x,
        y2: center.y
      });

      canvas.renderAll();
    });

    return () => canvas.dispose();
  }, []);

  const drawGrid = (canvas) => {
    const gridSize = 25;

    for (let i = 0; i < canvas.width / gridSize; i++) {
      const v = new Line(
        [i * gridSize, 0, i * gridSize, canvas.height],
        { stroke: "#1f2a3a", selectable: false, evented: false }
      );

      const h = new Line(
        [0, i * gridSize, canvas.width, i * gridSize],
        { stroke: "#1f2a3a", selectable: false, evented: false }
      );

      canvas.add(v);
      canvas.add(h);

      canvas.sendObjectToBack(v);
      canvas.sendObjectToBack(h);
    }
  };

  const snapToGrid = (obj) => {
    const grid = 25;
    obj.left = Math.round(obj.left / grid) * grid;
    obj.top = Math.round(obj.top / grid) * grid;
  };

  const createPins = (arduino) => {
    const canvas = canvasRef.current;

    const scaleX = arduino.getScaledWidth() / BASE_WIDTH;
    const scaleY = arduino.getScaledHeight() / BASE_HEIGHT;

    const spacing = (D2_CENTER.x - D13_CENTER.x) / 11;

    arduino.pins = [];

    for (let i = 0; i < 12; i++) {
      const pin = new Circle({
        left: arduino.left + (D13_CENTER.x + i * spacing) * scaleX,
        top: arduino.top + D13_CENTER.y * scaleY,
        radius: 4,
        fill: "#ffffff",
        stroke: "#0f172a",
        strokeWidth: 1.2,
        selectable: false,
        evented: false,
        objectCaching: false
      });

      pin.pinNumber = 13 - i;
      pin.offsetX = pin.left - arduino.left;
      pin.offsetY = pin.top - arduino.top;

      arduino.pins.push(pin);
      canvas.add(pin);
    }
  };

  const updateArduinoPins = (arduino) => {
    if (!arduino.pins) return;

    arduino.pins.forEach((pin) => {
      pin.set({
        left: arduino.left + pin.offsetX,
        top: arduino.top + pin.offsetY
      });

      updateWireForPin(pin);
    });

    canvasRef.current.renderAll();
  };

  const updateWireForPin = (pin) => {
    const components = [
      ...circuit.current.LEDs,
      ...circuit.current.BUTTONS
    ];

    components.forEach((component) => {
      if (component.wire?.fromPin !== pin) return;

      const center = component.getCenterPoint();
      component.wire.set({
        x1: pin.left + pin.radius,
        y1: pin.top + pin.radius,
        x2: center.x,
        y2: center.y
      });
    });
  };

  const addArduino = async () => {
    if (arduinoRef.current) return;

    const img = await FabricImage.fromURL(arduinoImg);

    img.set({ originX: "left", originY: "top" });
    img.scaleToWidth(380);
    img.componentType = "ARDUINO";
    img.objectCaching = false;

    canvasRef.current.add(img);
    canvasRef.current.centerObject(img);

    createPins(img);

    arduinoRef.current = img;
  };

  const addComponent = async (imgUrl, width, type) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!arduinoRef.current) {
      alert("Add Arduino first");
      return;
    }

    const pinNumber = assignPin();
    if (!pinNumber) return;

    const pinObj = arduinoRef.current.pins?.find((p) => p.pinNumber === pinNumber);
    if (!pinObj) return;

    const img = await FabricImage.fromURL(imgUrl);

    img.scaleToWidth(width);

    let left = type === "LED" ? 820 : 120;
    let top = type === "LED" ? ledY.current : buttonY.current;

    if (type === "LED") ledY.current += 90;
    else buttonY.current += 90;

    img.set({
      left,
      top,
      selectable: true,
      objectCaching: false
    });

    img.pin = pinNumber;
    img.componentType = type;
    img.connected = true;

    canvas.add(img);

    drawWire(canvas, img, pinObj);

    if (type === "LED") circuit.current.LEDs.push(img);
    if (type === "BUTTON") circuit.current.BUTTONS.push(img);
  };

  const updateComponentPin = (type, newPin) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const list = type === "LED" ? circuit.current.LEDs : circuit.current.BUTTONS;
    const component = list[0];
    if (!component) return;

    component.pin = newPin;

    if (component.wire) {
      canvas.remove(component.wire);
    }

    const pinObj = arduinoRef.current?.pins?.find((p) => p.pinNumber === newPin);
    if (pinObj) {
      drawWire(canvas, component, pinObj);
    }

    canvas.renderAll();
  };

  const turnOnLED = () => {
    circuit.current.LEDs.forEach((led) => {
      if (!led.connected) return;

      led.set({
        shadow: "0 0 55px rgba(255,60,60,1)"
      });
    });

    canvasRef.current.renderAll();
  };

  const turnOffLED = () => {
    circuit.current.LEDs.forEach((led) => {
      led.set({ shadow: null });
    });

    canvasRef.current.renderAll();
  };

  const generateCode = () => {
    let code = "";

    circuit.current.LEDs.forEach((led, i) => {
      code += `int led${i}=${led.pin};\n`;
    });

    circuit.current.BUTTONS.forEach((btn, i) => {
      code += `int button${i}=${btn.pin};\n`;
    });

    return code;
  };

  const resetSimulator = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      drawGrid(canvasRef.current);
    }

    resetPins();
    resetCircuit();

    arduinoRef.current = null;

    ledY.current = 120;
    buttonY.current = 120;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("componentType");

    if (type === "ARDUINO") addArduino();
    if (type === "LED") addComponent(ledImg, 80, "LED");
    if (type === "BUTTON") addComponent(buttonImg, 90, "BUTTON");
  };

  useImperativeHandle(ref, () => ({
    addArduino,
    addLED: () => addComponent(ledImg, 80, "LED"),
    addButton: () => addComponent(buttonImg, 90, "BUTTON"),
    generateCode,
    resetSimulator,
    updateComponentPin
  }));

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas id="canvas" />
    </div>
  );
});

export default CanvasBoard;