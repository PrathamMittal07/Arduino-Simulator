import { useRef } from "react";

export default function useCircuit() {
  const circuit = useRef({
    LEDs: [],
    BUTTONS: []
  });

  const resetCircuit = () => {
    circuit.current.LEDs = [];
    circuit.current.BUTTONS = [];
  };

  return { circuit, resetCircuit };
}