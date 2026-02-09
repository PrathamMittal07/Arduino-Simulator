import { useRef } from "react";

export default function useCircuit() {
  const circuit = useRef({
    LEDs: [],
    BUTTONS: [],
    POTENTIOMETERS: [],
    pinLogic: {}, // Logic state
  });

  const resetCircuit = () => {
    circuit.current.LEDs = [];
    circuit.current.BUTTONS = [];
    circuit.current.POTENTIOMETERS = [];
    circuit.current.pinLogic = {};
  };

  const setPinState = (pin, value) => {
    circuit.current.pinLogic[pin] = value;
  };

  return { circuit, resetCircuit, setPinState };
}