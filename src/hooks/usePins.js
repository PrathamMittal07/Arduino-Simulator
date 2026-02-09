import { useRef } from "react";

export default function usePins() {
  const pins = useRef([2,3,4,5,6,7,8,9,10,11,12,13]);

  const assignPin = () => {
    if (!pins.current.length) {
      console.warn("No pins available");
      return null;
    }

    return pins.current.shift();
  };

  const resetPins = () => {
    pins.current = [2,3,4,5,6,7,8,9,10,11,12,13];
  };

  return { assignPin, resetPins };
}