import React from "react";

function CodePanel({ code }) {
  return (
    <div
      style={{
        height: "100%",
        padding: "16px",
        background: "#0b1220",
        color: "#e2e8f0",
        fontFamily: "monospace",
        fontSize: "14px",
        overflow: "auto",
        borderTop: "1px solid #1f2937"
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "600" }}>
        Generated Arduino Code
      </div>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "#cbd5f5" }}>
        {code || "// Add components to generate code"}
      </pre>
    </div>
  );
}

export default CodePanel;