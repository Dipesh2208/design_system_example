import React from "react";
import ReactDOM from "react-dom/client";
import { AppButton } from "@repo/ui/atoms/AppButton";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Design System Documentation</h1>
      <p>Documentation and component catalog.</p>
      <div style={{ marginTop: "1rem" }}>
        <AppButton variant="primary">Component Atom</AppButton>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
