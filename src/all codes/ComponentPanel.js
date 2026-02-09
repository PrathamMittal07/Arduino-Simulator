import React from "react";

function ComponentPanel({ pinConfig, isRunning }) {
  return (
    <div
      style={{
        height: "100%",
        padding: "16px",
        background: "#0b1220",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        overflow: "auto",
        borderTop: "1px solid #1f2937"
      }}
    >
      <div style={{ fontWeight: "600", marginBottom: "10px" }}>
        Component Summary
      </div>

      <div style={{ marginBottom: "8px" }}>
        <strong>Arduino Uno</strong>
      </div>

      <div style={{ marginBottom: "6px", color: "#cbd5f5" }}>
        LED connected to: <strong>D{pinConfig.led}</strong>
      </div>
      <div style={{ marginBottom: "12px", color: "#cbd5f5" }}>
        Button connected to: <strong>D{pinConfig.button}</strong>
      </div>

      <div
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: "12px",
          background: isRunning ? "#22c55e" : "#64748b",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: "600"
        }}
      >
        {isRunning ? "RUNNING" : "STOPPED"}
      </div>

      <div style={{ marginTop: "16px", color: "#94a3b8", fontSize: "12px" }}>
        Switch to "Code" to view the generated Arduino sketch.
      </div>
    </div>
  );
}

export default ComponentPanel;