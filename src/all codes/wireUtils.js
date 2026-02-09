import { Line } from "fabric";

export const drawWire = (canvas, component, arduinoPin) => {
  if (!component || component.pin === undefined) return;

  const pin =
    arduinoPin ||
    canvas.getObjects().find((obj) => obj.pinNumber === component.pin);

  if (!pin) return;

  const center = component.getCenterPoint();

  const wireColor =
    component.componentType === "LED" ? "#ef4444" : "#60a5fa";

  const wire = new Line(
    [pin.left + pin.radius, pin.top + pin.radius, center.x, center.y],
    {
      stroke: wireColor,
      strokeWidth: 2,
      selectable: false,
      evented: false
    }
  );

  wire.fromPin = pin;
  component.wire = wire;
  component.connected = true;

  canvas.add(wire);

  if (typeof canvas.moveTo === "function") {
    canvas.moveTo(wire, canvas.getObjects().length - 1);
  }
};