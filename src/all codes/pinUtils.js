import { Circle } from "fabric";

export const createPin = (canvas, x, y, component, pinNumber) => {

  const pin = new Circle({
    left: x,
    top: y,
    radius: 6,
    fill: "#ffffff",
    stroke: "#2563eb",
    strokeWidth: 2,
    selectable: false,
    evented: false,
    originX: "center",
    originY: "center"
  });

  pin.pinNumber = pinNumber;
  pin.parentComponent = component; // ✅ FIXED
  pin.isPin = true;

  canvas.add(pin);

  return pin;
};

