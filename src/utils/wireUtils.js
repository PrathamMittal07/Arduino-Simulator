import { Polyline } from "fabric";

export const drawWire = (canvas, component, arduinoPin) => {
  if (!component || component.pin === undefined) return;

  const pin = arduinoPin || canvas.getObjects().find((obj) => obj.pinNumber === component.pin);
  if (!pin) return;

  const start = { x: pin.left + pin.radius, y: pin.top + pin.radius };
  const end = component.getCenterPoint();

  // Create professional 90-degree "Orthogonal" routing
  const midY = start.y + (end.y - start.y) / 2;
  const points = [
    { x: start.x, y: start.y }, // Start at Arduino Pin
    { x: start.x, y: midY },    // Vertical drop
    { x: end.x, y: midY },      // Horizontal shift
    { x: end.x, y: end.y }       // Final vertical to component
  ];

  const wireColor = component.componentType === "LED" ? "#ef4444" : 
                    component.componentType === "BUTTON" ? "#60a5fa" : "#3fb950";

  const wire = new Polyline(points, {
    stroke: wireColor,
    strokeWidth: 2,
    fill: 'transparent',
    selectable: false,
    evented: false,
    strokeLineJoin: 'round'
  });

  wire.fromPin = pin;
  component.wire = wire;
  component.connected = true;

  canvas.add(wire);
  canvas.sendObjectToBack(wire);
};